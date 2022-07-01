import { ApiPromise } from '@polkadot/api';
import { INFTController } from '../types';
import { collectionName16Decoder, decodeStruct, getCollectionProperties, getNFTProperties, hex2a } from '../utils/decoder';
import { fetchTokenImage, getTokenImage, getTokenImageUrl } from '../utils/imageUtils';
import { getEthAccount, normalizeAccountId } from '../utils/addressUtils';
import { MetadataType, NFTCollection, NFTToken, TokenId, UniqueDecoratedRpc } from './types';
import config from '../../../config';
import { checkTokenIsAllowed, filterAllowedTokens } from '../utils/checkTokenIsAllowed';

const { IPFSGateway } = config;

export type NFTControllerConfig = {
  collectionsIds: number[]
  allowedTokens: { collection: number; tokens: string }[];
}

class UniqueNFTController implements INFTController<NFTCollection, NFTToken> {
  private api: ApiPromise & { rpc: UniqueDecoratedRpc };
  private collectionsIds: number[];
  private allowedTokens: Record<number, string>;

  constructor(api: ApiPromise, config?: NFTControllerConfig) {
    this.api = api;
    this.collectionsIds = config?.collectionsIds || [];
    this.allowedTokens = config?.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
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

      const tokenData =
        (await this.api.rpc.unique?.tokenData(collectionId, tokenId))?.toJSON();

      if (!tokenData) {
        throw new Error(`TokenData for token ${tokenId} not found`);
      }
      const owner = normalizeAccountId(tokenData.owner || {}) as { Substrate: string, Ethereum: string };
      const tokenProperties = getNFTProperties(tokenData.properties);
      const collectionProperties = getCollectionProperties(collection);

      const attributes = decodeStruct({ attr: collectionProperties.constOnChainSchema, data: tokenProperties.constData });
      let imageUrl = '';

      if (collectionProperties.schemaVersion === 'Unique' && tokenProperties.constData) {
        const ipfsJson = JSON.parse(attributes.ipfsJson as string) as { ipfs: string };
        imageUrl = `${IPFSGateway}/${ipfsJson.ipfs}`;
      } else if (collectionProperties.schemaVersion === 'ImageUrl') {
        imageUrl = getTokenImageUrl(collectionProperties.offchainSchema, tokenId);
      } else if (collectionProperties.schemaVersion === 'tokenURI') {
        const collectionMetadata = JSON.parse(collectionProperties.offchainSchema) as MetadataType;
        imageUrl = await fetchTokenImage(collectionMetadata, tokenId);
      }

      let collectionCover = '';

      if (collectionProperties.variableOnChainSchema) {
        const collectionSchema = getCollectionProperties(collection);
        const image = JSON.parse(collectionSchema?.variableOnChainSchema)?.collectionCover as string;

        collectionCover = `${IPFSGateway}/${image}`;
      } else {
        if (collectionProperties?.offchainSchema) {
          collectionCover = await getTokenImage(collection, 1);
        }
      }

      const isAllowed = this.allowedTokens[collectionId] ? checkTokenIsAllowed(tokenId, this.allowedTokens[collectionId].split(',')) : true;
      console.log(isAllowed);

      return {
        id: tokenId,
        attributes,
        collectionId,
        imageUrl,
        owner,
        collectionName: collectionName16Decoder(collection.name.toJSON() as number[]),
        prefix: hex2a(collection.tokenPrefix.toHex()),
        description: collectionName16Decoder(collection.description.toJSON() as number[]),
        collectionCover,
        isAllowed
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
      try {
        const tokensIds =
          await this.api.rpc.unique?.accountTokens(collectionId, normalizeAccountId(account)) as TokenId[];
        const tokensIdsOnEth =
          await this.api.rpc.unique?.accountTokens(collectionId, normalizeAccountId(getEthAccount(account))) as TokenId[];

        const currentAllowedTokens = this.allowedTokens[collectionId];
        const allowedIds = filterAllowedTokens([...tokensIds, ...tokensIdsOnEth], currentAllowedTokens);
        const tokensOfCollection = (await Promise.all(allowedIds
        .map((item) =>
          this.getToken(collectionId, item.toNumber())))) as NFTToken[];

        tokens.push(...tokensOfCollection);
      } catch (e) {
        console.log(`Wrong ID of collection ${collectionId}`, e);
      }
    }

    return tokens;
  }
}

export default UniqueNFTController;
