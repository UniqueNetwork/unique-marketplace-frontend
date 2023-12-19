import { Signer as EthersSigner } from 'ethers';
import { CollectionProperty, Signer as UniqueSigner, TokenId } from '@unique-nft/sdk';
import { ChainValue } from '../controllers/BaseController';
import { CollectionMode, TransferTokenParams } from '../types';

export type Signer = EthersSigner | UniqueSigner;

export type NestTokenParam = {
  collectionId: number,
  tokenId: number
}
interface IBaseAdapter {
  getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, signer: Signer): Promise<string>
  transferToken(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, signer: Signer): Promise<void>

  getNestTokenFee(address: string, token: NestTokenParam, to: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<string>
  nestToken(address: string, token: NestTokenParam, to: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<void>

  getUnnestTokenFee(nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<string>
  unnestToken(nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<void>

  getTransferBalanceFee(from: string, to: string, amount: ChainValue, signer: Signer): Promise<string>
  transferBalance(from: string, to: string, amount: ChainValue, signer: Signer): Promise<void>

  setCollectionProperties(collectionId: number, properties: CollectionProperty[], signer: Signer): Promise<void>

  transferTokensBatch(transfers: TransferTokenParams[], signer: Signer, onSubmittedOne?: (token: TokenId, index: number) => void): Promise<void>
}

export default IBaseAdapter;
