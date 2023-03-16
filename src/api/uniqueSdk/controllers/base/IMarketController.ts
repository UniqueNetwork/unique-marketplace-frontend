import { BN } from '@polkadot/util';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { Address } from '@unique-nft/substrate-client/types';
import { TransactionOptions } from 'api/uniqueSdk/types';

interface IMarketController {
  changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, options: TransactionOptions): Promise<void>
  sellFix(collectionId: number, tokenId: number, price: number, amount: number, options: TransactionOptions): Promise<void>
  buyFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void>
  cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void>

  // _____ READ ONLY _____
  // TODO: type for order
  getOrder(collectionId: number, tokenId: number): Promise<any>
  getAccountBalance(address: Address): Promise<AllBalances>
  getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null>

  // _____ EXTRAS _____
  transferToken(from: Address, to: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  // TODO: 'from' can be taken from signer
  transferBalance(address: Address, destination: string, amount: BN, options: TransactionOptions): Promise<void>
}

export default IMarketController;
