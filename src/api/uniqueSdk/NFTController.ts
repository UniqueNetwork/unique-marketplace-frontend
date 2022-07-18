import { INFTController } from '../chainApi/types';
import { NFTCollection, NFTToken, TokenId } from '../chainApi/unique/types';
import { Sdk } from '@unique-nft/sdk';
import { CollectionInfo } from '@unique-nft/sdk/tokens';
import { Settings } from '../restApi/settings/types';
import { getEthAccount, normalizeAccountId } from './utils/addressUtils';
import { checkTokenIsAllowed, filterAllowedTokens } from './utils/checkTokenIsAllowed';
import { getTokenImage } from './utils/imageUtils';
import { getAttributes } from './utils/attributesUtils';
import config from '../../config';

const { IPFSGateway } = config;

export class UniqueSDKNFTController implements INFTController<NFTCollection, NFTToken> {
  private sdk: Sdk;
  private settings;
  private allowedTokens: Record<number, string>;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.settings = settings;
    this.allowedTokens = settings.blockchain?.unique?.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
  }

  async getAccountTokens(account: string): Promise<NFTToken[]> {
    if (!this.sdk?.api || !account) {
      return [];
    }
    const tokens: NFTToken[] = [];

    for (const collectionId of this.settings.blockchain.unique.collectionIds) {
      try {
        const tokensIds =
          // @ts-ignore
          await this.sdk?.api.rpc.unique?.accountTokens(collectionId, normalizeAccountId(account)) as TokenId[];
        const tokensIdsOnEth =
          // @ts-ignore
          await this.sdk?.api.rpc.unique?.accountTokens(collectionId, normalizeAccountId(getEthAccount(account))) as TokenId[];

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

  async getToken(collectionId: number, tokenId: number): Promise<NFTToken | null> {
    const token = await this.sdk.tokens.get({ collectionId, tokenId });
    const collection: CollectionInfo | null = await this.sdk.collections.get({ collectionId });
    if (!token || !collection) return null;

    let owner;
    if (token.owner) { owner = token.owner.startsWith('0x') ? { Ethereum: token.owner } : { Substrate: token.owner }; }

    let collectionCover = '';
    const { properties } = collection;
    if (properties?.variableOnChainSchema) {
      const image = JSON.parse(properties?.variableOnChainSchema)?.collectionCover as string;
      collectionCover = `${IPFSGateway}/${image}`;
    } else {
      if (properties?.offchainSchema) {
        collectionCover = await getTokenImage(properties, 1);
      }
    }

    const imageUrl = token.url || '';

    const { constData } = token.properties;
    const { fields } = collection.properties;

    const attributes = getAttributes(constData, fields);

    const isAllowed = this.allowedTokens[collectionId] ? checkTokenIsAllowed(tokenId, this.allowedTokens[collectionId].split(',')) : true;

    return {
      id: tokenId,
      owner,
      attributes,
      imageUrl,
      collectionId,
      collectionName: collection?.name,
      prefix: collection?.tokenPrefix,
      description: collection?.description,
      collectionCover,
      isAllowed
    };
  }
}
