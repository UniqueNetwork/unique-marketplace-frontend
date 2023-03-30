import IBaseAdapter, { Signer } from './IBaseAdapter';

interface IMarketContractAdapter extends IBaseAdapter {
  // TODO: remove "from" after SDK update
  changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void>
  sell(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void>
  buy(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void>
}

export default IMarketContractAdapter;
