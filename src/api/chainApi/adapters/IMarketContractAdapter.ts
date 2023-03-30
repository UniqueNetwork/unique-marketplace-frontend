import { Signer } from './IBaseAdapter';

interface IMarketContractAdapter {
  changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void>
  sellx(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void>
  buy(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void>
}

export default IMarketContractAdapter;
