import { ApiPromise } from '@polkadot/api';
import { ICollectionController } from '../types';
import { NFTCollection, NFTToken } from './types';
import { getOnChainSchema, hex2a } from '../utils/decoder';
import { getTokenImage } from '../utils/imageUtils';
import config from '../../../config';

const { IPFSGateway } = config;

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
        if (collectionInfo.offchainSchema) {
          coverImageUrl = await getTokenImage(collectionInfo, 1);
        }
      }

      return {
        ...collectionInfo,
        coverImageUrl,
        id: collectionId
      };
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e);
    }

    return null;
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
