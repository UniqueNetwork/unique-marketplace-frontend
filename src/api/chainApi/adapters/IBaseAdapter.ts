import { Signer as EthersSigner } from 'ethers';
import { CollectionProperty, Signer as UniqueSigner, TokenId, CreateCollectionBody, CreateCollectionParsed, PropertyKeyPermission, CreateTokenPayload, SetSponsorshipBody, SetCollectionLimitsBody } from '@unique-nft/sdk';
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
  setTokenPropertyPermissions(collectionId: number, propertyPermissions: PropertyKeyPermission[], signer: Signer): Promise<void>

  createCollection(payload: CreateCollectionBody, signer: Signer): Promise<CreateCollectionParsed | undefined>
  getCreateCollectionFee(payload: CreateCollectionBody, signer: Signer): Promise<string>

  transferTokensBatch(transfers: TransferTokenParams[], signer: Signer, onSubmittedOne?: (token: TokenId, index: number) => void): Promise<void>
  createTokens(payload: { tokens: CreateTokenPayload[], collectionId: number }, signer: Signer): Promise<TokenId[] | undefined>

  getSetSponsorshipFee(payload: SetSponsorshipBody, signer: Signer): Promise<string>;
  setSponsorship(payload: SetSponsorshipBody, signer: Signer): Promise<void>;

  getSetCollectionLimitsFee(payload: SetCollectionLimitsBody, signer: Signer): Promise<string>;
  setCollectionLimits(payload: SetCollectionLimitsBody, signer: Signer): Promise<void>;

  burn(payload: { collectionId: number, tokenId: number }, signer: Signer): Promise<void>;
}

export default IBaseAdapter;
