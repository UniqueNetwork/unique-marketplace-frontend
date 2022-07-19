import { ICollectionController, TransactionOptions } from '../chainApi/types';
import { NFTCollection, NFTToken, TokenId } from '../chainApi/unique/types';
import { Sdk } from '@unique-nft/sdk';
import '@unique-nft/sdk/tokens';
import { Settings } from '../restApi/settings/types';

export class UniqueSDKCollectionController implements ICollectionController<NFTCollection, NFTToken> {
  private sdk: Sdk;
  private settings;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.settings = settings;
  }

  async confirmSponsorship(collectionId: number, options: TransactionOptions): Promise<void> {
    const tx = await this.sdk.sponsorhip.confirmSponsorship(collectionId, options.signer);
    const { signerPayloadJSON } = tx;
    const signature = await options.signPayloadJSON?.(tx.signerPayloadJSON);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<NFTCollection | null> {
    const collection = await this.sdk.collections.get({ collectionId });

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

  // TODO: unused method
  getCollections(): Promise<NFTCollection[]> {
    return Promise.resolve([]);
  }

  async getFeaturedCollections(): Promise<NFTCollection[]> {
    const collections: Array<NFTCollection> = [];
    const { collectionIds } = this.settings.blockchain.unique;
    for (let i = 0; i < collectionIds.length; i++) {
      const collectionInf = await this.getCollection(collectionIds[i]);

      if (collectionInf && collectionInf.owner && collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' && !collections.find((collection) => collection.id === collectionIds[i])) {
        collections.push({ ...collectionInf, id: collectionIds[i] });
      }
    }
    return collections;
  }

  // TODO: unused method
  getTokensOfCollection(collectionId: number, ownerId: string): Promise<TokenId[]> {
    return Promise.resolve([]);
  }

  async removeCollectionSponsor(collectionId: number, options: TransactionOptions): Promise<void> {
    const tx = await this.sdk.sponsorhip.removeCollectionSponsor(collectionId, options.signer);
    const { signerPayloadJSON } = tx;
    const signature = await options.signPayloadJSON?.(tx.signerPayloadJSON);
    if (!signature) throw new Error('Signing failed');
    // @ts-ignore
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON,
      signature
    });
  }

  async setCollectionSponsor(collectionId: number, sponsorAddress: string, options: TransactionOptions): Promise<void> {
    const tx = await this.sdk.sponsorhip.setCollectionSponsor(collectionId, sponsorAddress, options.signer);
    const { signerPayloadJSON } = tx;
    const signature = await options.signPayloadJSON?.(tx.signerPayloadJSON);
    if (!signature) throw new Error('Signing failed');
    // @ts-ignore
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON,
      signature
    });
  }
}
