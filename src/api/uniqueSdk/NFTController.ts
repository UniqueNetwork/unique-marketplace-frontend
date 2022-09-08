import { Sdk } from '@unique-nft/substrate-client';
import { UniqueDecoratedRpc } from './types';
import { Settings } from '../restApi/settings/types';
import { getEthAccount, normalizeAccountId } from './utils/addressUtils';
import { filterAllowedTokens } from './utils/checkTokenIsAllowed';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';

export class UniqueSDKNFTController {
  private sdk: Sdk;
  private readonly collectionIds: number[];
  private readonly allowedTokens: Record<number, string>;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.collectionIds = settings.blockchain.unique.collectionIds;
    this.allowedTokens = settings.blockchain?.unique?.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
  }

  async getAccountMarketableTokens(account: string): Promise<TokenByIdResult[]> {
    if (!this.sdk?.api || !account) {
      return [];
    }
    const tokens: TokenByIdResult[] = [];
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
            this.getToken(collectionId, item.toNumber())))) as TokenByIdResult[];

        tokens.push(...tokensOfCollection);
      } catch (e) {
        console.log(`Wrong ID of collection ${collectionId}`, e);
      }
    }
    return tokens;
  }

  async getToken(collectionId: number, tokenId: number): Promise<TokenByIdResult | null> {
    return await this.sdk.tokens.get_new({ collectionId, tokenId });
  }
}
