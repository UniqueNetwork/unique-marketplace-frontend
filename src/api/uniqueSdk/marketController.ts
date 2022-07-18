import { BN } from '@polkadot/util';
import { IMarketController, TransactionOptions, TSignMessage } from '../chainApi/types';
import { AddressOrPair } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import { Sdk } from '@unique-nft/sdk';
import { Settings } from '../restApi/settings/types';

export class MarketController implements IMarketController {
  private sdk: Sdk;
  private settings;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.settings = settings;
  }

  kusamaDecimals = 12;

  addDeposit(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  addToWhiteList(account: string, options: TransactionOptions, signMessage: TSignMessage): Promise<void> {
    return Promise.resolve(undefined);
  }

  buyToken(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  cancelSell(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  checkWhiteListed(account: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getKusamaFee(sender: AddressOrPair, recipient: string | undefined, value: BN | undefined): Promise<Balance | null> {
    return Promise.resolve(null);
  }

  getUserDeposit(account: string): Promise<BN> {
    return Promise.resolve(new BN(0));
  }

  lockNftForSale(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  sendNftToSmartContract(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  setForFixPriceSale(account: string, collectionId: string, tokenId: string, price: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  transferBalance(from: string, to: string, amount: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  transferBidBalance(from: string, amount: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  transferToAuction(owner: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  transferToken(from: string, to: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  unlockNft(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  withdrawDeposit(account: string, options: TransactionOptions): Promise<void> {
    return Promise.resolve(undefined);
  }
}
