import { BN } from '@polkadot/util';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { Address } from '@unique-nft/substrate-client/types';
import { TransactionOptions } from 'api/uniqueSdk/types';

interface IMarketController {
  changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, options: TransactionOptions): Promise<void>
  // price is in SC format
  // ex. to sell for 1 QTZ - price=100000000000000000(18 decimals)
  // amount - "1" for NFT, and amount of pieces for RFT
  sellFix(collectionId: number, tokenId: number, price: number, amount: number, options: TransactionOptions): Promise<void>
  buyFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void>
  cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void>

  // TODO: type for order
  getOrder(collectionId: number, tokenId: number): Promise<any>

  // TODO: we can get rid of those methods and just use SDK
  getAccountBalance(address: Address): Promise<AllBalances>
  getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null>
  transferToken(from: Address, to: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  transferBalance(address: Address, destination: string, amount: BN, options: TransactionOptions): Promise<void>
}

export default IMarketController;
