import { Sdk } from '@unique-nft/substrate-client';
// eslint-disable-next-line import/no-duplicates
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';
import { TransactionOptions } from './types';
import { Settings } from '../restApi/settings/types';
// eslint-disable-next-line import/no-duplicates
import '@unique-nft/substrate-client/tokens';

export class UniqueSDKCollectionController {
  private sdk: Sdk;
  private collectionIds: number[];
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.collectionIds = settings.blockchain.unique.collectionIds;
  }

  async confirmSponsorship(collectionId: number, options: TransactionOptions): Promise<void> {
    if (!options.signer) return;
    const unsignedTxPayload = await this.sdk.collections.confirmSponsorship.build({ collectionId, address: options.signer });
    const signature = await options.sign?.(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<CollectionInfoWithSchema | null> {
    return await this.sdk.collections.get_new({ collectionId });
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

  async removeCollectionSponsor(collectionId: number, options: TransactionOptions): Promise<void> {
    if (!options.signer) return;
    const unsignedTxPayload = await this.sdk.collections.removeSponsorship.build({ collectionId, address: options.signer });
    const signature = await options.sign?.(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }
}
