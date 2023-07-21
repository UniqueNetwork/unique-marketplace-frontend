import { CollectionProperty } from '@unique-nft/sdk';
import { EthCrossAccountId } from '@unique-nft/utils';
import IBaseAdapter, { Signer } from './IBaseAdapter';

interface IMarketContractAdapter extends IBaseAdapter {
  // TODO: remove "from" after SDK update
  setCollectionProperties(collectionId: number, properties: CollectionProperty[], signer: Signer): Promise<void>
  changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void>
  sell(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void>
  buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void>
  getSellFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string>
  getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string>
}

export default IMarketContractAdapter;
