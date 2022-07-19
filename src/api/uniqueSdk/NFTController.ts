import { INFTController } from '../chainApi/types';
import { NFTCollection, NFTToken, TokenId } from '../chainApi/unique/types';
import { Sdk } from '@unique-nft/sdk';
import { Settings } from '../restApi/settings/types';
import { getEthAccount, normalizeAccountId } from './utils/addressUtils';
import { checkTokenIsAllowed, filterAllowedTokens } from './utils/checkTokenIsAllowed';

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
    const token = await this.sdk.tokens.get_new({ collectionId, tokenId });
    const collection = await this.sdk.collections.get_new({ collectionId });
    if (!token || !collection) return null;

    const { owner, attributes, image } = token;
    const { name, tokenPrefix, description, schema } = collection;

    const imageUrl = image?.fullUrl || '';
    const collectionCover = schema?.coverPicture?.fullUrl || '';

    const isAllowed = this.allowedTokens[collectionId] ? checkTokenIsAllowed(tokenId, this.allowedTokens[collectionId].split(',')) : true;

    return {
      id: tokenId,
      owner,
      attributes,
      imageUrl,
      collectionId,
      collectionName: name,
      prefix: tokenPrefix,
      description,
      collectionCover,
      isAllowed
    };
  }
}
