import { Sdk } from '@unique-nft/sdk';
import { NFTToken, UniqueDecoratedRpc, UniqueController } from './types';
import { getEthAccount, normalizeAccountId } from './utils/addressUtils';
import { checkTokenIsAllowed, filterAllowedTokens } from './utils/checkTokenIsAllowed';

type UniqueSDKNFTControllerOptions = { sdk: Sdk, collectionIds: number[], allowedTokens: { collection: number, tokens: string }[] };

export class UniqueSDKNFTController implements UniqueController {
  private sdk: Sdk | undefined;
  private collectionIds: number[] = [];
  private allowedTokens: Record<number, string> = {};

  initiate(options: UniqueSDKNFTControllerOptions): void {
    this.sdk = options.sdk;
    this.collectionIds = options.collectionIds;
    this.allowedTokens = options.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
  }

  async getAccountMarketableTokens(account: string): Promise<NFTToken[]> {
    if (!this.sdk?.api || !account) {
      return [];
    }
    const tokens: NFTToken[] = [];
    const { unique } = (this.sdk?.api.rpc as UniqueDecoratedRpc);

    for (const collectionId of this.collectionIds) {
      try {
        const tokensIds =
          await unique?.accountTokens(collectionId, normalizeAccountId(account)) || [];
        const tokensIdsOnEth =
          await unique?.accountTokens(collectionId, normalizeAccountId(getEthAccount(account))) || [];

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
    const token = await this.sdk?.tokens.get_new({ collectionId, tokenId });
    const collection = await this.sdk?.collections.get_new({ collectionId });
    if (!token || !collection) return null;

    const { owner, attributes, image, video } = token;
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
      isAllowed,
      video
    };
  }
}
