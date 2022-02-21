import { ApiPromise } from '@polkadot/api';
import { INFTController } from '../types';
import { NFTCollection, NFTToken } from './types';
import { normalizeAccountId } from '../utils/normalizeAccountId';
import { decodeStruct, getOnChainSchema } from '../utils/decoder';
import { getTokenImage } from '../utils/imageUtils';

class UniqueNFTController implements INFTController<NFTCollection, NFTToken> {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  public async getToken(collectionId: number, tokenId: number): Promise<NFTToken | null> {
    if (!this.api || !collectionId) {
      return null;
    }

    try {
      const collection =
        // @ts-ignore
        await this.api.rpc.unique.collectionById(collectionId.toString());

      const collectionInfo = collection.toJSON() as unknown as NFTCollection;

      if (!collection) {
        return null;
      }

      const variableData =
        // @ts-ignore
        (await this.api.rpc.unique.variableMetadata(collectionId, tokenId)).toJSON() as string;
      const constData: string =
        // @ts-ignore
        (await this.api.rpc.unique.constMetadata(collectionId, tokenId)).toJSON() as string;
      const crossAccount = normalizeAccountId(
        // @ts-ignore
        (await this.api.rpc.unique.tokenOwner(collectionId, tokenId)).toJSON() as string
      ) as { Substrate: string };

      let imageUrl = '';

      if (collectionInfo.offchainSchema) {
        imageUrl = await getTokenImage(collectionInfo, tokenId);
      }

      const onChainSchema = getOnChainSchema(collectionInfo);

      return {
        attributes: {
          ...decodeStruct({ attr: onChainSchema.attributesConst, data: constData }),
          ...decodeStruct({ attr: onChainSchema.attributesVar, data: variableData })
        },
        constData,
        id: tokenId,
        imageUrl,
        owner: crossAccount,
        variableData
      };
    } catch (e) {
      console.log('getDetailedTokenInfo error', e);

      return null;
    }
  }
}

export default UniqueNFTController;
