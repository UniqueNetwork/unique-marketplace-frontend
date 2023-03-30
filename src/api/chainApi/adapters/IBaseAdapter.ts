import { Address } from '@unique-nft/substrate-client/types';
import { Signer as EthersSigner } from 'ethers';
import { Signer as UniqueSigner } from '@unique-nft/sdk';

export type Signer = EthersSigner | UniqueSigner; // TODO: ?

interface IBaseAdapter {
  transferToken(from: Address, to: Address, collectionId: number, tokenId: number, signer: Signer): Promise<void>
  transferBalance(from: Address, to: string, amount: number, signer: Signer): Promise<void>
}

export default IBaseAdapter;
