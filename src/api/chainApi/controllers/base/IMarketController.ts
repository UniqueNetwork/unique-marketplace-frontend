import { BN } from '@polkadot/util';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { Address } from '@unique-nft/substrate-client/types';
import { TransactionOptions } from 'api/chainApi/types';
interface IMarketController {
  changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, options: TransactionOptions): Promise<void>
  // TODO: decimals calculation should be part of controller, methods should accept floats instead
  // price is in SC format
  // ex. to sell for 1 QTZ - price=100000000000000000(18 decimals)
  // amount - "1" for NFT, and amount of pieces for RFT
  sellFix(collectionId: number, tokenId: number, price: number, amount: number, options: TransactionOptions): Promise<void>
  buyFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void>
  cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void>

  // TODO: type for order
  getOrder(collectionId: number, tokenId: number): Promise<any>

  getAccountBalance(address: Address): Promise<AllBalances>

  // TODO: split into "getTransferTokenFee" and "getTransferBalanceFee"
  getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null>

  // TODO: remove "from" param, we can calculate it from signer
  transferToken(from: Address, to: Address, collectionId: number, tokenId: number, options: TransactionOptions): Promise<void>
  transferBalance(from: Address, to: string, amount: BN, options: TransactionOptions): Promise<void>
}

export default IMarketController;
