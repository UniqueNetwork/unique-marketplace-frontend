import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';
import { ChainValue } from '../controllers/BaseController';

export type Signer = EthersSigner | UniqueSigner;

export type NestTokenParam = {
  collectionId: number,
  tokenId: number
}
interface IBaseAdapter {
  transferToken(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<void>

  nestToken(from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<void>
  unnestToken(from: NestTokenParam, amount: number, signer: Signer): Promise<void>

  transferBalance(from: string, to: string, amount: ChainValue, signer: Signer): Promise<void>
}

export default IBaseAdapter;
