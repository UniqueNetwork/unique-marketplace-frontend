import { ApiPromise } from '@polkadot/api';
import { ICollectionController } from '../types';
import { NFTCollection, NFTToken, TokenId, UniqueDecoratedRpc } from './types';
import { collectionName16Decoder, getCollectionProperties, hex2a } from '../utils/decoder';
import { getTokenImage } from '../utils/imageUtils';
import config from '../../../config';

const { IPFSGateway } = config;

class UniqueCollectionController implements ICollectionController<NFTCollection, NFTToken> {
  private api: ApiPromise & { rpc: UniqueDecoratedRpc };
  private featuredCollectionIds: number[];

  constructor(api: ApiPromise, featuredCollectionIds: number[]) {
    this.api = api;
    this.featuredCollectionIds = featuredCollectionIds;
  }

  public async getCollection(collectionId: number): Promise<NFTCollection | null> {
    if (!this.api) {
      return null;
    }

    const collection =
      (await this.api.rpc.unique?.collectionById(collectionId.toString()))?.value;

    if (!collection) return null;

    let coverImageUrl = '';

    const collectionProperties = getCollectionProperties(collection);

    if (collectionProperties?.attributesVar) {
      const image = JSON.parse(collectionProperties?.attributesVar)?.collectionCover as string;

      coverImageUrl = `${IPFSGateway}/${image}`;
    } else {
      if (collectionProperties.offchainSchema) {
        coverImageUrl = await getTokenImage(collection, 1);
      }
    }

    return {
      id: collectionId,
      owner: collection.owner,
      tokenPrefix: collection.tokenPrefix?.toUtf8() || '',
      collectionName: collectionName16Decoder(collection.name.toJSON() as number[]),
      description: hex2a(collection.description?.toHex() || ''),
      coverImageUrl
    };
  }

  public getCollections(): Promise<NFTCollection[]> {
    throw new Error('There to many collections available, please use featured collections instead');
    // if (!this.api) {
    //   return [];
    // }
    //
    // try {
    //   // @ts-ignore
    //   const fullCount = (await this.api.rpc.unique.collectionStats()) as { created: u32, destroyed: u32 };
    //   const createdCollectionCount = fullCount.created.toNumber();
    //   const destroyedCollectionCount = fullCount.destroyed.toNumber();
    //   const collectionsCount = createdCollectionCount - destroyedCollectionCount;
    //   const collections: Array<NFTCollection> = [];
    //
    //   for (let i = 1; i <= collectionsCount; i++) {
    //     const collectionInf = await this.getCollection(i) as unknown as NFTCollection;
    //
    //     if (collectionInf && collectionInf.owner && collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
    //       collections.push({ ...collectionInf, id: i });
    //     }
    //   }
    //
    //   return collections;
    // } catch (e) {
    //   throw e;
    // }
  }

  public async getFeaturedCollections(): Promise<NFTCollection[]> {
    if (!this.api || !this.featuredCollectionIds.length) {
      return [];
    }

    const collections: Array<NFTCollection> = [];
    for (let i = 0; i < this.featuredCollectionIds.length; i++) {
      const collectionInf = await this.getCollection(this.featuredCollectionIds[i]);

      if (collectionInf && collectionInf.owner && collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' && !collections.find((collection) => collection.id === this.featuredCollectionIds[i])) {
        collections.push({ ...collectionInf, id: this.featuredCollectionIds[i] });
      }
    }

    return collections;
  }

  public async getTokensOfCollection(collectionId: number, ownerId: string): Promise<TokenId[]> {
    if (!this.api || !collectionId || !ownerId) {
      return [];
    }

    return (await this.api.rpc.unique?.accountTokens(collectionId, { Substrate: ownerId })) || [];
  }
}

export default UniqueCollectionController;
