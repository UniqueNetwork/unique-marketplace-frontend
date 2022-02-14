import { ApiPromise } from '@polkadot/api';
import { ICollectionController } from '../types';
import { NFTCollection, NFTToken } from './types';
import { collectionName8Decoder, getOnChainSchema, hex2a } from '../utils/decoder';
import { getTokenImage } from '../utils/imageUtils';
import config from '../../../config';
import { u32 } from '@polkadot/types';

const { IPFSGateway, uniqueCollectionIds } = config;

class UniqueCollectionController implements ICollectionController<NFTCollection, NFTToken> {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  public async getCollection(collectionId: number): Promise<NFTCollection | null> {
    if (!this.api) {
      return null;
    }

    try {
      const collection =
        // @ts-ignore
        await this.api.rpc.unique.collectionById(collectionId.toString());

      const collectionInfo = collection.toJSON() as unknown as NFTCollection;
      let coverImageUrl = '';

      if (collectionInfo?.variableOnChainSchema && hex2a(collectionInfo?.variableOnChainSchema)) {
        const collectionSchema = getOnChainSchema(collectionInfo);
        const image = JSON.parse(collectionSchema?.attributesVar)?.collectionCover as string;

        coverImageUrl = `${IPFSGateway}/${image}`;
      } else {
        if (collectionInfo?.offchainSchema) {
          coverImageUrl = await getTokenImage(collectionInfo, 1);
        }
      }

      return {
        ...collectionInfo,
        collectionName: collectionInfo?.name && collectionName8Decoder(collectionInfo?.name),
        coverImageUrl,
        id: collectionId
      };
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e);
    }

    return null;
  }

  public async getFeaturedCollections(): Promise<NFTCollection[]> {
    if (!this.api) {
      return [];
    }

    try {
      // @ts-ignore
      const fullCount = (await this.api.rpc.unique.collectionStats()) as { created: u32, destroyed: u32 };
      const createdCollectionCount = fullCount.created.toNumber();
      const destroyedCollectionCount = fullCount.destroyed.toNumber();
      const collectionsCount = createdCollectionCount - destroyedCollectionCount;
      const collections: Array<NFTCollection> = [];

      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await this.getCollection(i) as unknown as NFTCollection;

        if (collectionInf && collectionInf.owner && collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
          collections.push({ ...collectionInf, id: i });
        }
      }

      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);

      return [];
    }
  }

  public async getCollections(): Promise<NFTCollection[]> {
    if (!this.api) {
      return [];
    }

    try {
      const collections: Array<NFTCollection> = [];
      if (uniqueCollectionIds && uniqueCollectionIds.length) {
        for (let i = 1; i <= uniqueCollectionIds.length; i++) {
          const collectionInf = await this.getCollection(uniqueCollectionIds[i]) as unknown as NFTCollection;

          if (collectionInf && collectionInf.owner && collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' && !collections.find((collection) => collection.id === uniqueCollectionIds[i])) {
            collections.push({ ...collectionInf, id: uniqueCollectionIds[i] });
          }
        }
      }

      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);

      return [];
    }
  }

  public async getTokensOfCollection(collectionId: number, ownerId: number): Promise<NFTToken[]> {
    if (!this.api || !collectionId || !ownerId) {
      return [];
    }

    try {
      // @ts-ignore
      return await this.api.query.unique.accountTokens(collectionId, { Substrate: ownerId });
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }
}

export default UniqueCollectionController;
