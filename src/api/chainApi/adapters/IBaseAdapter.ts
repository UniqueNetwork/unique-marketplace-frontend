import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';
import { ChainValue } from '../controllers/BaseController';

export type Signer = EthersSigner | UniqueSigner;

export type NestTokenParam = {
  collectionId: number,
  tokenId: number
}
interface IBaseAdapter {
  getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<string>
  transferToken(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<void>

  getNestTokenFee(from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<string>
  nestToken(from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<void>

  getUnnestTokenFee(from: NestTokenParam, amount: number, signer: Signer): Promise<string>
  unnestToken(from: NestTokenParam, amount: number, signer: Signer): Promise<void>

  getTransferBalanceFee(from: string, to: string, amount: ChainValue, signer: Signer): Promise<string>
  transferBalance(from: string, to: string, amount: ChainValue, signer: Signer): Promise<void>
}

export default IBaseAdapter;
