import { BN } from '@polkadot/util';
import { AccountBalances } from 'account/types';
import { Address } from '@unique-nft/utils';
import { sleep } from 'utils/helpers';

import marketplaceAbi from './contracts/marketplace-0.json';
import { NetworkOptions } from '../sdk/sdkClient';

import IMarketController from './controllers/base/IMarketController';
import { CollectionMode, TransactionOptions } from './types';
import BaseController from './controllers/BaseController';
import { MarketContract, MarketContractAbiItem } from 'api/restApi/settings/types';
import { IMarketContractProperties, TokenForOrder } from './adapters/IMarketContractAdapter';
import { Account } from 'account/types';

class MarketController extends BaseController implements IMarketController {
  public decimals = 18; // TODO: move from controller to API

  actualContract: IMarketContractProperties;
  contracts: MarketContract[] = [];
  contractsAbi: Record<string, MarketContractAbiItem[]> = {};

  private getActualContract() {
    let actualContract = this.contracts[0];
    this.contracts.forEach((contract) => {
      if (contract.version > actualContract.version) {
        actualContract = contract;
      }
    });
    return actualContract;
  }

  constructor(options: NetworkOptions) {
    super(options);
    this.contracts = options.settings.blockchain.unique.contracts;
    if (this.contracts.length === 0) throw new Error('Market API didn\'t provide deployed contracts');
    this.contractsAbi = options.settings.blockchain.unique.contractsAbi || {};
    const contractAddress = this.getActualContract().address;
    this.actualContract = {
      address: contractAddress,
      abi: this.contractsAbi[contractAddress]
    };
  }

  public setNetwork(options: NetworkOptions): void {
    super.setNetwork(options);
    this.contracts = options.settings.blockchain.unique.contracts;
    if (this.contracts.length === 0) throw new Error('Market API didn\'t provide deployed contracts');
    this.contractsAbi = options.settings.blockchain.unique.contractsAbi || {};
    const contractAddress = this.getActualContract().address;
    this.actualContract = {
      address: contractAddress,
      abi: this.contractsAbi[contractAddress]
    };
  }

  async changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, { account, contractAddress }: TransactionOptions): Promise<void> {
    if (!account) throw new Error('Account not provided');
    const from = account.address;
    const to = contractAddress || this.actualContract.address;
    const isAlreadyAllowed = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from, to });
    if (isAlreadyAllowed.isAllowed === targetAllowance) return;
    const adapter = this.getAdapter(account);
    await adapter.changeAllowance(from, to, collectionId, tokenId, targetAllowance, account.signer);
    const newAllowance = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from, to });
    if (newAllowance.isAllowed !== targetAllowance) throw new Error('Allowance change failed');
  }

  public async estimateGasChangeAllowance(collectionId: number, tokenId: number, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    const rawFee = await adapter.estimateGasChangeAllowance(
      account.address,
      this.actualContract.address,
      collectionId,
      tokenId,
      true,
      account.signer,
    );
    return this.getChainValue(rawFee, this.decimals).parsed.toString();
  }

  /**
   *
   * @param collectionId
   * @param tokenId
   * @param price - human format (ex. 1.25, not 125000000000000000)
   * @param amount - amount of fractions, 1 for NFT
   * @param param4 - signer and extras
   */
  async sellFix(collectionId: number, tokenId: number, price: number, currency: number, decimals: number, amount: number, { account }: TransactionOptions): Promise<void> {
    const from = Address.extract.ethCrossAccountId(account.address);
    const to = this.actualContract.address;
    const isAllowed = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from: account.address, to });
    if (!isAllowed.isAllowed) throw new Error('Token not approved for sale');
    const adapter = this.getAdapter(account);
    // chain format from human format: 1.25 -> 1250000000000000000
    const priceWithDecimals = (collectionId ? (price * (10 ** decimals)) : (price * (10 ** this.decimals))).toLocaleString('fullwide', { useGrouping: false });
    await adapter.sell(from, collectionId, tokenId, priceWithDecimals, currency, amount, account.signer, this.actualContract);
    await sleep(1000); // little lag to make sure offer is added to db
  }

  async sellBatchFix(tokens: TokenForOrder[], account: Account): Promise<void> {
    const from = Address.extract.ethCrossAccountId(account.address);
    const adapter = this.getAdapter(account);
    console.log(tokens, 'UPDATED_TYPES')
  
    tokens = tokens.map(token => ({
      tokenId: token.tokenId,
      collectionId: token.collectionId,
      currency: token.currency,
      amount: 1,
      seller: from,
      price: token.price.toString()
    }));
  
    await adapter.sellBatch(tokens, account.signer, this.actualContract);
  }

  async buyFix(collectionId: number, tokenId: number, amount: number, { account, contractAddress }: TransactionOptions): Promise<void> {
    const to = Address.extract.ethCrossAccountId(account.address);

    const order = (await this.getOrder(collectionId, tokenId, contractAddress));
    const value = order.price as { type: string, hex: string };
    if (!value || !value.hex) throw new Error('Order price incorrect');
    const adapter = this.getAdapter(account);

    const parsedPrice = BigInt(value.hex).toString();
    await adapter.buy({to, collectionId, tokenId, price: parsedPrice, amount, signer: account.signer,
      contract: contractAddress
      ? {
        address: contractAddress,
        abi: this.contractsAbi[contractAddress]
      }
      : this.actualContract
    });
  }

  async cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    if (!options) throw new Error('Account not found');
    // throws error if not found
    await this.getOrder(collectionId, tokenId);
    await this.changeAllowance(collectionId, tokenId, false, options);
  }

  async getOrder(collectionId: number, tokenId: number, contractAddress?: string): Promise<any> {
    if (!collectionId || !tokenId) throw new Error(`Cant get order for ${collectionId}-${tokenId}`);
    try {
      const res = await this.uniqueSdk.evm.call({
        abi: marketplaceAbi as any,
        address: '5CSxpZepJj5dxkSBEDnN23pgg6B5X6VFRJ2kyubhb5Svstuu', // TODO: remove after sdk update
        contractAddress: contractAddress || this.actualContract.address,
        funcName: 'getOrder',
        args: [collectionId, tokenId]
      });
      return res;
    } catch (e) {
      console.error('Failed to get order', e);
      throw e;
    }
  }

  async getAccountBalance(address: string): Promise<AccountBalances> {
    const response = await this.uniqueSdk.balance.get({ address });
    let ethMirror = { parsed: '0', raw: new BN(0) };
    if (Address.is.substrateAddress(address)) {
      const withdrawBalance = await this.uniqueSdk.balance.get({
        address: Address.mirror.substrateToEthereum(address)
      });
      ethMirror = {
        raw: new BN(withdrawBalance?.availableBalance?.raw || 0),
        parsed: withdrawBalance?.availableBalance?.amount
      };
    }
    if (!response) throw new Error('Failed to fetch balance');
    const proper = {
      raw: new BN(response?.availableBalance?.raw || 0),
      parsed: response?.availableBalance?.amount || '0'
    };
    return {
      proper,
      ethMirror
    };
  }
  async transferBalanceFungible({
    collectionId,
    address,
    recipient,
    amount,
    account,
    decimals
  }: {
    collectionId: number;
    address: string;
    recipient: string;
    amount: number;
    account: Account;
    decimals: number;
  }): Promise<any> {
    const adapter = this.getAdapter(account);

    return await adapter.transferBalanceFungible({
      collectionId,
      address,
      recipient,
      amount,
      decimals,
      signer: account.signer
    });
  }

  async getTransferBalanceFungibleFee({
    collectionId,
    address,
    recipient,
    amount,
    account
  }: {
    collectionId: number;
    address: string;
    recipient: string;
    amount: number;
    account: Account;
  }): Promise<any> {
    const adapter = this.getAdapter(account);

    return await adapter.getTransferBalanceFungibleFee({
      collectionId,
      address,
      recipient,
      amount,
      signer: account.signer
    });
  }

  async allowanceFungible({
    collectionId,
    address,
    recipient,
    amount,
    account
  }: {
    collectionId: number;
    address: string;
    recipient: string;
    amount: number;
    account: Account;
  }): Promise<any> {
    const adapter = this.getAdapter(account);

    return await adapter.allowanceFungible({
      collectionId,
      address,
      recipient,
      amount,
      signer: account.signer
    });
  }

  async getAccountBalanceFungible({collectionId, address}: {collectionId: number, address: string}): Promise<any> {
    if (!collectionId) return;

    const response = await this.uniqueSdk.fungible.getBalance({collectionId, address});
    return response;
  }

  async getTransferTokenFee(sender: string, recipient: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, { account }: TransactionOptions): Promise<string | null> {
    const adapter = this.getAdapter(account);
    const rawFee = await adapter.getTransferTokenFee(sender, recipient, collectionId, tokenId, mode, amount, account.signer);
    return this.getChainValue(rawFee, this.decimals).parsed.toString();
  }

  // ____ EXTRA _____
  async transferToken(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account).transferToken(from, to, collectionId, tokenId, mode, amount, account.signer);
  }

  async getTransferBalanceFee(sender: string, recipient: string, value: number, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    const rawFee = await adapter.getTransferBalanceFee(sender, recipient, this.getChainValue(value, this.decimals), account?.signer);
    return this.getChainValue(rawFee, this.decimals).parsed.toString();
  }

  /**
   *
   * @param from Sender
   * @param to Receiver
   * @param amount amount to send. Send as number if in human format, BN/string for chain formats.
   * @param param3
   */
  async transferBalance(from: string, to: string, amount: BN | number | string, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account).transferBalance(from, to, this.getChainValue(amount, this.decimals), account.signer);
  }

  hasContractMethod(contractAddress: string, method: string): boolean {
    return !!this.contractsAbi[contractAddress]?.find(({ name }) => name === method);
  }

  async changePrice(collectionId: number, tokenId: number, price: number, currency: number, decimals: number, { account, contractAddress }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    const contract = contractAddress
    ? {
        address: contractAddress,
        abi: this.contractsAbi[contractAddress]
      }
    : this.actualContract;
    const priceWithDecimals = (collectionId ? (price * (10 ** decimals)) : (price * (10 ** this.decimals))).toLocaleString('fullwide', { useGrouping: false });
    await adapter.changePrice(collectionId, tokenId, priceWithDecimals, currency, account.signer, contract);
  }

  async revokeTokenSell({
    collectionId,
    tokenId,
    contractProps
  }: {collectionId: number, tokenId: number, contractProps: TransactionOptions}) {
    const adapter = this.getAdapter(contractProps.account);
    const contractAddress = contractProps.contractAddress;
    const contract = contractAddress
      ? {
          address: contractAddress,
          abi: this.contractsAbi[contractAddress]
        }
      : this.actualContract;
    await adapter.revokeTokenSell({
      collectionId,
      tokenId,
      contract,
      signer: contractProps.account.signer
    });
  }
}

export default MarketController;
