import { Client } from '@unique-nft/substrate-client';
// eslint-disable-next-line import/no-duplicates
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';
import { TransactionOptions, UniqueController } from './types';
// eslint-disable-next-line import/no-duplicates
import '@unique-nft/substrate-client/tokens';

export class UniqueSDKCollectionController implements UniqueController {
  private sdk: Client | undefined;
  private collectionIds: number[] = [];

  setNetwork(options: { sdk: Client, collectionIds: number[] }): void {
    this.sdk = options.sdk;
    this.collectionIds = options.collectionIds;
  }

  async confirmSponsorship(collectionId: number, { signer }: TransactionOptions): Promise<void> {
    if (!this.sdk) throw new Error('Controller isn\'t ready');
    if (!signer) return;
    const unsignedTxPayload = await this.sdk.collections.confirmSponsorship.build({ collectionId, address: signer.getAddress() });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.sdk.collections.confirmSponsorship.sign(unsignedTxPayload, { signer });
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<CollectionInfoWithSchema | null> {
    return await this.sdk?.collections.get({ collectionId }) || null;
  }

  async getFeaturedCollections(): Promise<CollectionInfoWithSchema[]> {
    const collections: Array<CollectionInfoWithSchema> = [];
    for (let i = 0; i < this.collectionIds.length; i++) {
      const collectionInf = await this.getCollection(this.collectionIds[i]);

      if (collectionInf &&
        collectionInf.owner &&
        collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' &&
        !collections.find((collection) => collection.id === this.collectionIds[i])) {
        collections.push({ ...collectionInf, id: this.collectionIds[i] });
      }
    }
    return collections;
  }

  async removeCollectionSponsor(collectionId: number, { signer }: TransactionOptions): Promise<void> {
    if (!this.sdk) throw new Error('Controller isn\'t ready');
    if (!signer) return;
    const unsignedTxPayload = await this.sdk.collections.removeSponsorship.build({ collectionId, address: signer.getAddress() });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.sdk.collections.removeSponsorship.sign(unsignedTxPayload, { signer });
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }
}
