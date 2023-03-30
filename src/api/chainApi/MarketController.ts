import { BN } from '@polkadot/util';
import { MetamaskAccount } from '@unique-nft/accounts/metamask';
import { Client, Sdk } from '@unique-nft/sdk';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { Address } from '@unique-nft/substrate-client/types';
import marketplaceAbi from './contracts/marketplace-0.json';
import { NetworkOptions } from '../sdk/sdkClient';
import IMarketContractAdapter from './adapters/IMarketContractAdapter';
import MetamaskAdapter from './adapters/MetamaskAdapter';
import UniqueAdapter from './adapters/UniqueAdapter';
import IBaseController from './controllers/base/IBaseController';
import IMarketController from './controllers/base/IMarketController';
import { TransactionOptions } from './types';

class MarketController implements IMarketController, IBaseController {
  uniqueSdk: Client;
  contractAddress: string;
  uniqueAdapter: UniqueAdapter;
  metamaskAdapter: MetamaskAdapter;
  isConnected = false;
  public decimals = 12; // TODO: move from controller to API

  constructor(options: NetworkOptions) {
    const contractAddress = options.settings.blockchain.unique.contractAddress;
    this.contractAddress = contractAddress;
    this.uniqueSdk = new Sdk({ baseUrl: options.sdkEndpoint });
    this.uniqueAdapter = new UniqueAdapter(contractAddress, this.uniqueSdk);
    this.metamaskAdapter = new MetamaskAdapter(contractAddress);
    this.isConnected = true;
  }

  // #region BASE
  public setNetwork(options: NetworkOptions): void {
    const contractAddress = options.settings.blockchain.unique.contractAddress;
    this.contractAddress = contractAddress;
    const sdk = this.uniqueSdk = new Sdk({ baseUrl: options.sdkEndpoint });
    this.uniqueSdk = sdk;
    this.isConnected = false;
    this.uniqueAdapter = new UniqueAdapter(contractAddress, sdk);
    this.metamaskAdapter = new MetamaskAdapter(contractAddress);
    this.isConnected = true;
  }

  private isMetamaskSigner(account: any): boolean {
    return account instanceof MetamaskAccount;
  }

  // TODO: provide type for account
  // TODO: extract connection type from signer to figure out whether we are working with polka or evm
  protected getAdapter(account: any): IMarketContractAdapter {
    // all non-sign calls can be postponed to default unique sdk
    if (!account) {
      return this.getDefaultAdapter();
    }
    if (this.isMetamaskSigner(account)) {
      return this.metamaskAdapter;
    }
    return this.uniqueAdapter;
  }

  protected getDefaultAdapter(): IMarketContractAdapter {
    return this.uniqueAdapter;
  }

  // #endregion BASE

  async changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, { account }: TransactionOptions): Promise<void> {
    if (!account) throw new Error('Account not provided');
    const from = account.address;
    const to = this.contractAddress;
    const isAlreadyAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (isAlreadyAllowed.isAllowed === targetAllowance) return;
    const unsignedTxPayload = await this.uniqueSdk.tokens.approve.build({ collectionId, tokenId, spender: to, address: from, isApprove: targetAllowance });
    const { signature } = await this.uniqueSdk.tokens.approve.sign(unsignedTxPayload, { signer: account });

    if (!signature) throw new Error('Signing failed');

    const adapter = this.getAdapter(account);
    await adapter.changeAllowance(from, to, collectionId, tokenId, targetAllowance, account.signer);
  }

  async sellFix(collectionId: number, tokenId: number, price: number, amount: number, { account }: TransactionOptions): Promise<void> {
    const from = account.address;
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (!isAllowed) throw new Error('Token not approved for sale');
    const adapter = this.getAdapter(account);
    await adapter.sell(from, collectionId, tokenId, price, amount, account.signer);
  }

  async buyFix(collectionId: number, tokenId: number, amount: number, { account }: TransactionOptions): Promise<void> {
    const from = account.address;
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (!isAllowed) throw new Error('Token not approved for sale');

    const value = (await this.getOrder(collectionId, tokenId))[3]; // order.value
    const adapter = this.getAdapter(account);
    await adapter.buy(from, collectionId, tokenId, value, amount, account.signer);
  }

  async cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    if (!options.account) throw new Error('Account not found');
    // throws error if not found
    await this.getOrder(collectionId, tokenId);
    await this.changeAllowance(collectionId, tokenId, false, options);
  }

  async getOrder(collectionId: number, tokenId: number): Promise<any> {
    if (!collectionId || !tokenId) throw new Error(`Cant get order for ${collectionId}-${tokenId}`);
    try {
      const res = await this.uniqueSdk.evm.call({
        abi: marketplaceAbi,
        address: '5EALag5gFWyjbz9kYV5VNUr7tjg9MrAMg2nZhWwSmAHdaiZp', // TODO: this arg makes no sense, cant skip
        contractAddress: this.contractAddress,
        funcName: 'getOrder',
        args: [collectionId, tokenId] as any // TODO: ???
      });
      return res;
    } catch (e) {
      console.error('Failed to get order', e);
      throw e;
    }
  }

  async getAccountBalance(address: string): Promise<AllBalances> {
    return await this.uniqueSdk.balance.get({ address });
  }

  // TODO: split into multiple "get fee for method X". Put them in adapters
  async getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null> {
    await Promise.resolve();
    return '0';
  }

  // ____ EXTRA _____
  async transferToken(from: Address, to: Address, collectionId: number, tokenId: number, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account).transferToken(from, to, collectionId, tokenId, account.signer);
  }

  async transferBalance(from: Address, to: string, amount: BN, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account).transferBalance(from, to, amount.toNumber(), account.signer);
  }
}

export default MarketController;
