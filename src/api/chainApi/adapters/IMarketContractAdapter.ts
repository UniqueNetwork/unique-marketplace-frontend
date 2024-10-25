import { EthCrossAccountId } from '@unique-nft/utils';
import { CollectionNestingAndPermissionStruct$1 } from '../types';
import IBaseAdapter, { Signer } from './IBaseAdapter';
import { SetSponsorshipBody } from '@unique-nft/sdk';

export interface IMarketContractProperties {
    address: string
    abi?: object
}

export interface ITransferFungible {
  collectionId: number
  address: string
  recipient: string
  amount: number
  decimals?: number
  signer?: Signer
}

export interface IPurchaseTokenData {
  to: EthCrossAccountId;
  collectionId: number;
  tokenId: number;
  price: string;
  amount: number;
  signer: Signer;
  contract: IMarketContractProperties;
}

export interface IRemoveFromSell {
  collectionId: number;
  tokenId: number;
  signer?: Signer;
  contract: IMarketContractProperties;
}

interface IMarketContractAdapter extends IBaseAdapter {
  changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void>
  estimateGasChangeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<string>

  sell(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, currency: number, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<void>
  buy({to, collectionId, tokenId, price, amount, signer, contract}:  IPurchaseTokenData): Promise<void>
  getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<string>

  changePrice(collectionId: number, tokenId: number, price: string, currency: number, signer: Signer, contract: IMarketContractProperties): Promise<void>
  setCollectionNesting(collectionId: number, value: CollectionNestingAndPermissionStruct$1): Promise<void>

  transferBalanceFungible({collectionId, address, recipient, amount, decimals, signer}: ITransferFungible): Promise<void>
  getTransferBalanceFungibleFee({collectionId, address, recipient, amount, decimals, signer}: ITransferFungible): Promise<string>

  allowanceFungible({collectionId, address, recipient, amount, signer}: ITransferFungible): Promise<void>
  revokeTokenSell({collectionId, tokenId, contract, signer}: IRemoveFromSell): Promise<void>

  confirmCollectionSponsorship(payload: SetSponsorshipBody, signer: Signer): Promise<void>
  getConfirmSponsorshipFee(payload: SetSponsorshipBody, signer: Signer): Promise<string>
}

export default IMarketContractAdapter;
