import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';

export type Signer = EthersSigner | UniqueSigner;

interface IBaseAdapter {
  transferToken(from: string, to: string, collectionId: number, tokenId: number, signer: Signer): Promise<void>
  transferBalance(from: string, to: string, amount: number, signer: Signer): Promise<void>
}

export default IBaseAdapter;
