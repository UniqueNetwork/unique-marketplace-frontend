import { ICollectionController, TransactionOptions } from '../chainApi/types';
import { NFTCollection, NFTToken, TokenId } from '../chainApi/unique/types';
import { Sdk } from '@unique-nft/sdk';
import { Settings } from '../restApi/settings/types';
import { getTokenImage } from './utils/imageUtils';
import config from '../../config';

const { IPFSGateway } = config;

export class UniqueSDKCollectionController implements ICollectionController<NFTCollection, NFTToken> {
  private sdk: Sdk;
  private settings;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.settings = settings;
  }

  async confirmSponsorship(collectionId: number, options: TransactionOptions): Promise<void> {
    const tx = await this.sdk.extrinsics.build({
      section: 'unique',
      method: 'confirmSponsorship',
      args: [collectionId],
      address: options.signer || '',
      isImmortal: false
    });
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
    const { name, description, owner, properties, tokenPrefix, sponsorship } = collection;

    let coverImageUrl = '';

    if (properties?.variableOnChainSchema) {
      const image = JSON.parse(properties?.variableOnChainSchema)?.collectionCover as string;

      coverImageUrl = `${IPFSGateway}/${image}`;
    } else {
      if (properties?.offchainSchema) {
        coverImageUrl = await getTokenImage(properties, 1);
      }
    }

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
    const tx = await this.sdk.extrinsics.build({
      section: 'unique',
      method: 'removeCollectionSponsor',
      args: [collectionId],
      address: options.signer || '',
      isImmortal: false
    });
    const { signerPayloadJSON } = tx;
    const signature = await options.signPayloadJSON?.(tx.signerPayloadJSON);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON,
      signature
    });
  }

  async setCollectionSponsor(collectionId: number, sponsorAddress: string, options: TransactionOptions): Promise<void> {
    const tx = await this.sdk.extrinsics.build({
      section: 'unique',
      method: 'setCollectionSponsor',
      args: [collectionId],
      address: options.signer || '',
      isImmortal: false
    });
    const { signerPayloadJSON } = tx;
    const signature = await options.signPayloadJSON?.(tx.signerPayloadJSON);
    if (!signature) throw new Error('Signing failed');
    await this.sdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON,
      signature
    });
  }
}
