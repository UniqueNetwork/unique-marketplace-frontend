import { BN } from '@polkadot/util';
import { MarketAccountBalance } from 'account/AccountContext';
import { Address, CrossAccountId } from '@unique-nft/utils';
import marketplaceAbi from './contracts/marketplace-0.json';
import { NetworkOptions } from '../sdk/sdkClient';

import IMarketController from './controllers/base/IMarketController';
import { TransactionOptions } from './types';
import BaseController from './controllers/BaseController';

class MarketController extends BaseController implements IMarketController {
  contractAddress: string;
  public decimals = 18; // TODO: move from controller to API

  constructor(options: NetworkOptions) {
    super(options);
    const contractAddress = options.settings.blockchain.unique.contracts[0].address;
    this.contractAddress = contractAddress;
  }

  public setNetwork(options: NetworkOptions): void {
    const contractAddress = options.settings.blockchain.unique.contracts[0].address;
    this.contractAddress = contractAddress;
    super.setNetwork(options);
  }

  async changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, { account }: TransactionOptions): Promise<void> {
    if (!account) throw new Error('Account not provided');
    const from = account.address;
    const to = this.contractAddress;
    const isAlreadyAllowed = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from, to });
    if (isAlreadyAllowed.isAllowed === targetAllowance) return;

    const adapter = this.getAdapter(account.account);
    await adapter.changeAllowance(from, to, collectionId, tokenId, targetAllowance, account.signer);
    const newAllowance = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from, to });
    if (newAllowance.isAllowed !== targetAllowance) throw new Error('Allowance change failed');
  }

  /**
   *
   * @param collectionId
   * @param tokenId
   * @param price - human format (ex. 1.25, not 125000000000000000)
   * @param amount - amount of fractions, 1 for NFT
   * @param param4 - signer and extras
   */
  async sellFix(collectionId: number, tokenId: number, price: number, amount: number, { account }: TransactionOptions): Promise<void> {
    const from = Address.extract.ethCrossAccountId(account.address);
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from: account.address, to });
    if (!isAllowed.isAllowed) throw new Error('Token not approved for sale');
    const adapter = this.getAdapter(account.account);
    // chain format from human format: 1.25 -> 1250000000000000000
    const priceWithDecimals = (price * (10 ** this.decimals)).toString();
    await adapter.sell(from, collectionId, tokenId, priceWithDecimals, amount, account.signer);
  }

  async buyFix(collectionId: number, tokenId: number, amount: number, { account }: TransactionOptions): Promise<void> {
    const to = Address.extract.ethCrossAccountId(account.address);

    const order = (await this.getOrder(collectionId, tokenId));
    const value = order.price; // order.value
    const seller = order.seller[0] as CrossAccountId;
    console.log('seller', seller); // TODO: recheck allowance? If so - which out of two accounts
    // const isAllowed = await this.uniqueSdk.token.allowance({ collectionId, tokenId, from: seller.eth, to });
    // if (!isAllowed.isAllowed) throw new Error('Token not approved for sale');
    const adapter = this.getAdapter(account.account);
    await adapter.buy(to, collectionId, tokenId, value, amount, account.signer);
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
        abi: marketplaceAbi as any,
        address: '5CSxpZepJj5dxkSBEDnN23pgg6B5X6VFRJ2kyubhb5Svstuu', // TODO: remove after sdk update
        contractAddress: this.contractAddress,
        funcName: 'getOrder',
        args: [collectionId, tokenId]
      });
      return res;
    } catch (e) {
      console.error('Failed to get order', e);
      throw e;
    }
  }

  async getAccountBalance(address: string): Promise<MarketAccountBalance> {
    const balance = await this.uniqueSdk.balance.get({ address });
    if (!balance) throw new Error('Failed to fetch balance');
    return { raw: new BN(balance?.freeBalance?.raw || 0), parsed: balance?.freeBalance?.amount || '0' };
  }

  // TODO: split into multiple "get fee for method X". Put them in adapters
  async getFee(sender: string, recipient?: string, value?: BN): Promise<string | null> {
    await Promise.resolve();
    return '0';
  }

  // ____ EXTRA _____
  async transferToken(from: string, to: string, collectionId: number, tokenId: number, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account.account).transferToken(from, to, collectionId, tokenId, account.signer);
  }

  async transferBalance(from: string, to: string, amount: BN, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account.account).transferBalance(from, to, amount.toNumber(), account.signer);
  }
}

export default MarketController;
