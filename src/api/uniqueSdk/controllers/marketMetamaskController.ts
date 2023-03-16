import { Address } from '@unique-nft/substrate-client/types';
import { BN } from '@polkadot/util';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { TransactionOptions } from '../types';
import IMarketController from './base/IMarketController';
import MetamaskController from './base/MetamaskController';

export class MarketMetamaskController implements MetamaskController, IMarketController {
  changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, options: TransactionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  sellFix(collectionId: number, tokenId: number, price: number, amount: number, options: TransactionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  buyFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getOrder(collectionId: number, tokenId: number): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getAccountBalance(address: string): Promise<AllBalances> {
    throw new Error('Method not implemented.');
  }

  transferToken(from: string, to: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  transferBalance(address: Address, destination: string, amount: BN, { signer, send }: TransactionOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  setNetwork(options: unknown): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export default MarketMetamaskController;
