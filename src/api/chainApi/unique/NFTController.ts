import { ApiPromise } from '@polkadot/api';
import { INFTController } from '../types';
import { NFTCollection, NFTToken } from './types';
import { collectionName16Decoder, decodeStruct, getOnChainSchema, hex2a } from '../utils/decoder';
import { getTokenImage } from '../utils/imageUtils';
import { getEthAccount, normalizeAccountId } from '../utils/addressUtils';
import config from '../../../config';

const { IPFSGateway } = config;

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

      const tokenData = (await this.api.query.nonfungible.tokenData(collectionId, tokenId)).toJSON() as { owner: { Substrate?: string, Ethereum?: string } };
      const crossAccount = normalizeAccountId(tokenData?.owner as { Substrate: string }) as { Substrate: string, Ethereum: string };

      let imageUrl = '';

      const onChainSchema = getOnChainSchema(collectionInfo);

      if (collectionInfo.offchainSchema) {
        // imageUrl = await getTokenImage(collectionInfo, tokenId);
        // TODO: Temporary solution to IPFS outage (use constant url base instead of collectionSchema)
        const attributes = {
          ...decodeStruct({ attr: onChainSchema.attributesConst, data: constData }),
          ...decodeStruct({ attr: onChainSchema.attributesVar, data: variableData })
        };
        const ipfsJson = JSON.parse(attributes.ipfsJson as string) as { ipfs: string };
        imageUrl = `https://ipfs.unique.network/ipfs/${ipfsJson.ipfs}`;
      }


      let collectionCover = '';

      if (collectionInfo?.variableOnChainSchema && hex2a(collectionInfo?.variableOnChainSchema)) {
        const collectionSchema = getOnChainSchema(collectionInfo);
        const image = JSON.parse(collectionSchema?.attributesVar)?.collectionCover as string;

        collectionCover = `${IPFSGateway}/${image}`;
      } else {
        if (collectionInfo?.offchainSchema) {
          collectionCover = await getTokenImage(collectionInfo, 1);
        }
      }
      
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
        prefix: hex2a(collectionInfo.tokenPrefix),
        description: collectionName16Decoder(collectionInfo.description),
        collectionCover
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
    const tokens: NFTToken[] = [];

    for (const collectionId of this.collectionsIds) {
      const tokensIds =
        // @ts-ignore
        await this.api.rpc.unique.accountTokens(collectionId, normalizeAccountId(account)) as TokenId[];
      const tokensIdsOnEth =
        // @ts-ignore
        await this.api.rpc.unique.accountTokens(collectionId, normalizeAccountId(getEthAccount(account))) as TokenId[];

      const tokensOfCollection = (await Promise.all([...tokensIds, ...tokensIdsOnEth].map((item) =>
        this.getToken(collectionId, item.toNumber())))) as NFTToken[];

      tokens.push(...tokensOfCollection);
    }

    return tokens;
  }
}

type TokenId = {
  toNumber(): number
};

export default UniqueNFTController;
