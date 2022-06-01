import { ApiPromise } from '@polkadot/api';
import { INFTController } from '../types';
import { collectionName16Decoder, decodeStruct, getCollectionProperties, hex2a } from '../utils/decoder';
import { fetchTokenImage, getTokenImage, getTokenImageUrl } from '../utils/imageUtils';
import { getEthAccount, normalizeAccountId } from '../utils/addressUtils';
import { MetadataType, NFTCollection, NFTToken, TokenId, UniqueDecoratedRpc } from './types';
import config from '../../../config';

const { IPFSGateway } = config;

export type NFTControllerConfig = {
  collectionsIds: number[]
}

class UniqueNFTController implements INFTController<NFTCollection, NFTToken> {
  private api: ApiPromise & { rpc: UniqueDecoratedRpc };
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
        (await this.api.rpc.unique?.collectionById(collectionId.toString()))?.value;

      if (!collection) {
        return null;
      }

      const variableData =
        (await this.api.rpc.unique?.variableMetadata(collectionId, tokenId))?.toJSON();
      const constData =
        (await this.api.rpc.unique?.constMetadata(collectionId, tokenId))?.toJSON();

      const tokenData = (await this.api.query.nonfungible.tokenData(collectionId, tokenId)).toJSON() as { owner: { Substrate?: string, Ethereum?: string } };
      const owner = normalizeAccountId(tokenData?.owner as { Substrate: string }) as { Substrate: string, Ethereum: string };

      let imageUrl = '';

      const collectionProperties = getCollectionProperties(collection);

      const decodedConstData = decodeStruct({ attr: collectionProperties.attributesConst, data: constData });
      const decodedVariableData = decodeStruct({ attr: collectionProperties.attributesVar, data: variableData });

      const schemaVersion = collectionProperties.schemaVersion;

      if (schemaVersion === 'Unique' && decodedConstData.ipfsJson) {
        const ipfsJson = JSON.parse(decodedConstData.ipfsJson as string) as { ipfs: string };
        imageUrl = `${IPFSGateway}/${ipfsJson.ipfs}`;
      } else if (schemaVersion === 'ImageURL') {
        imageUrl = getTokenImageUrl(collectionProperties.offchainSchema, tokenId);
      } else if (schemaVersion === 'tokenURI') {
        const collectionMetadata = JSON.parse(collectionProperties.offchainSchema) as MetadataType;
        imageUrl = await fetchTokenImage(collectionMetadata, tokenId);
      }

      let collectionCover = '';

      if (collectionProperties.attributesVar) {
        const collectionSchema = getCollectionProperties(collection);
        const image = JSON.parse(collectionSchema?.attributesVar)?.collectionCover as string;

        collectionCover = `${IPFSGateway}/${image}`;
      } else {
        if (collectionProperties?.offchainSchema) {
          collectionCover = await getTokenImage(collection, 1);
        }
      }

      return {
        id: tokenId,
        attributes: {
          ...decodedConstData,
          ...decodedVariableData
        },
        collectionId,
        imageUrl,
        owner,
        collectionName: collectionName16Decoder(collection.name.toJSON() as number[]),
        prefix: hex2a(collection.tokenPrefix.toHex()),
        description: collectionName16Decoder(collection.description.toJSON() as number[]),
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
        await this.api.rpc.unique?.accountTokens(collectionId, normalizeAccountId(account)) as TokenId[];
      const tokensIdsOnEth =
        await this.api.rpc.unique?.accountTokens(collectionId, normalizeAccountId(getEthAccount(account))) as TokenId[];

      const tokensOfCollection = (await Promise.all([...tokensIds, ...tokensIdsOnEth].map((item) =>
        this.getToken(collectionId, item.toNumber())))) as NFTToken[];

      tokens.push(...tokensOfCollection);
    }

    return tokens;
  }
}

export default UniqueNFTController;
