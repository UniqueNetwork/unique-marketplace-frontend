import { BN } from '@polkadot/util';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { Address } from '@unique-nft/substrate-client/types';
import BaseController from './BaseController';
import IMarketController from './controllers/base/IMarketController';
import { TransactionOptions } from './types';

class MarketController extends BaseController<IMarketController> implements IMarketController {
  public decimals = 12; // TODO: move from controller to API
  changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, options: TransactionOptions): Promise<void> {
    return this.getController(options.signer).changeAllowance(collectionId, tokenId, targetAllowance, options);
  }

  sellFix(collectionId: number, tokenId: number, price: number, amount: number, options: TransactionOptions): Promise<void> {
    return this.getController(options.signer).sellFix(collectionId, tokenId, price, amount, options);
  }

  buyFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    return this.getController(options.signer).buyFix(collectionId, tokenId, amount, options);
  }

  cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    return this.getController(options.signer).cancelFix(collectionId, tokenId, amount, options);
  }

  getOrder(collectionId: number, tokenId: number): Promise<any> {
    return this.getDefaultController().getOrder(collectionId, tokenId);
  }

  getAccountBalance(address: string): Promise<AllBalances> {
    return this.getDefaultController().getAccountBalance(address);
  }

  // TODO: refactor this method out
  getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null> {
    return this.getDefaultController().getFee(sender, recipient, value);
  }

  // ____ EXTRA _____
  transferToken(from: Address, to: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return this.getController(options.signer).transferToken(from, to, collectionId, tokenId, options);
  }

  transferBalance(from: Address, to: string, amount: BN, options: TransactionOptions): Promise<void> {
    return this.getController(options.signer).transferBalance(from, to, amount, options);
  }
}

export default MarketController;
