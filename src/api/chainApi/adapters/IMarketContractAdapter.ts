import { CollectionProperty } from '@unique-nft/sdk';
import { EthCrossAccountId } from '@unique-nft/utils';
import { CollectionNestingAndPermissionStruct$1 } from '../types';
import IBaseAdapter, { Signer } from './IBaseAdapter';

export interface IMarketContractProperties {
    address: string
    abi?: object
}

export interface ITransferFungible {
  collectionId: number
  address: string
  recipient: string
  amount: number
  signer?: Signer
}

interface IMarketContractAdapter extends IBaseAdapter {
  changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void>

  sell(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, currency: number, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<void>
  buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<void>
  getSellFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, currency: number, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<string>
  getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<string>

  changePrice(collectionId: number, tokenId: number, price: string, currency: number, signer: Signer, contract: IMarketContractProperties): Promise<void>
  getChangePriceFee(collectionId: number, tokenId: number, price: string, currency: number, signer: Signer, contract: IMarketContractProperties): Promise<string>
  setCollectionNesting(collectionId: number, value: CollectionNestingAndPermissionStruct$1): Promise<void>

  transferBalanceFungible({collectionId, address, recipient, amount, signer}: ITransferFungible): Promise<void>
  getTransferBalanceFungibleFee({collectionId, address, recipient, amount, signer}: ITransferFungible): Promise<string>
}

export default IMarketContractAdapter;
