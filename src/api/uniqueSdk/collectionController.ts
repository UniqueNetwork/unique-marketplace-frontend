import { Sdk } from '@unique-nft/substrate-client';
import '@unique-nft/substrate-client/tokens';
import { TransactionOptions, NFTCollection, UniqueController } from './types';

export class UniqueSDKCollectionController implements UniqueController {
  private sdk: Sdk | undefined;
  private collectionIds: number[] = [];

  initialize(options: { sdk: Sdk, collectionIds: number[] }): void {
    this.sdk = options.sdk;
    this.collectionIds = options.collectionIds;
  }

  async confirmSponsorship(collectionId: number, options: TransactionOptions): Promise<void> {
    const unsignedTxPayload = await this.sdk?.sponsorhip.confirmSponsorship(collectionId, options.signer);
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const signature = await options.sign?.(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.sdk?.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<NFTCollection | null> {
    const collection = await this.sdk?.collections.get_new({ collectionId });

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
    const unsignedTxPayload = await this.sdk?.sponsorhip.removeCollectionSponsor(collectionId, options.signer);
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const signature = await options.sign?.(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.sdk?.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }
}
