import { ApiPromise } from '@polkadot/api';
import { INFTController } from '../types';
import { NFTCollection, NFTToken } from './types';
import { normalizeAccountId } from '../utils/normalizeAccountId';
import { collectionName16Decoder, decodeStruct, getOnChainSchema, hex2a } from '../utils/decoder';
import { getTokenImage } from '../utils/imageUtils';
import { UpDataStructsTokenId } from '@unique-nft/types';

export type NFTControllerConfig = {
  collectionsIds: number[]
}

class UniqueNFTController implements INFTController<NFTCollection, NFTToken> {
  private api: ApiPromise;
  private collectionsIds: number[];

  constructor(api: ApiPromise, config?: NFTControllerConfig) {
    this.api = api;
    this.collectionsIds = config?.collectionsIds || [];
  }

  public async getToken(collectionId: number, tokenId: number): Promise<NFTToken | null> {
    if (!this.api || !collectionId) {
      return null;
    }

    try {
      const collection =
        // @ts-ignore
        await this.api.rpc.unique.collectionById(collectionId.toString());

      if (!collection) {
        return null;
      }

      const collectionInfo = collection.toJSON() as unknown as NFTCollection;

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
        collectionId,
        imageUrl,
        owner: crossAccount,
        variableData,
        collectionName: collectionName16Decoder(collectionInfo.name),
        prefix: hex2a(collectionInfo.tokenPrefix)
      };
    } catch (e) {
      console.log('getDetailedTokenInfo error', e);

      return null;
    }
  }

  public async getAccountTokens(account: string): Promise<NFTToken[]> {
    if (!this.api || !account) {
      return [];
    }
    try {
      const tokens: NFTToken[] = [];

      for (const collectionId of this.collectionsIds) {
        const tokensIds: UpDataStructsTokenId[] =
          // @ts-ignore
          await this.api.rpc.unique.accountTokens(collectionId, normalizeAccountId(account));

        const tokensOfCollection = (await Promise.all(tokensIds.map((item) =>
          this.getToken(collectionId, item.toNumber())))) as NFTToken[];

        tokens.push(...tokensOfCollection);
      }

      return tokens;
    } catch (e) {
      throw e;
    }
  }
}

export default UniqueNFTController;
