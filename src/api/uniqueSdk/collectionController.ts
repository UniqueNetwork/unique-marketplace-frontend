import { Sdk } from '@unique-nft/sdk';
import '@unique-nft/sdk/tokens';
import { TransactionOptions, NFTCollection } from './types';
import { Settings } from '../restApi/settings/types';

export class UniqueSDKCollectionController {
  private sdk: Sdk;
  private collectionIds: number[];
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.collectionIds = settings.blockchain.unique.collectionIds;
  }

  async confirmSponsorship(collectionId: number, options: TransactionOptions): Promise<void> {
    const unsignedTxPayload = await this.sdk.sponsorhip.confirmSponsorship(collectionId, options.signer);
    const signature = await options.sign?.(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<NFTCollection | null> {
    const collection = await this.sdk.collections.get_new({ collectionId });

    if (!collection) return null;

    const { name, description, owner, schema, tokenPrefix, sponsorship } = collection;
    const coverImageUrl = schema?.coverPicture?.fullUrl || '';

    return {
      id: collectionId,
      tokenPrefix,
      coverImageUrl,
      collectionName: name,
      description,
      owner,
      sponsorship
    };
  }

  async getFeaturedCollections(): Promise<NFTCollection[]> {
    const collections: Array<NFTCollection> = [];
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
    const unsignedTxPayload = await this.sdk.sponsorhip.removeCollectionSponsor(collectionId, options.signer);
    const signature = await options.sign?.(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }
}
