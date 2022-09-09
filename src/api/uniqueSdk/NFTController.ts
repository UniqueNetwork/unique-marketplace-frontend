import { Sdk } from '@unique-nft/substrate-client';
import { TokenId, UniqueController } from './types';
import { getEthAccount } from './utils/addressUtils';
import { filterAllowedTokens } from './utils/checkTokenIsAllowed';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { Address } from '@unique-nft/substrate-client/types';

type UniqueSDKNFTControllerOptions = { sdk: Sdk, collectionIds: number[], allowedTokens: { collection: number, tokens: string }[] };

export class UniqueSDKNFTController implements UniqueController {
  private sdk: Sdk | undefined;
  private collectionIds: number[] = [];
  private allowedTokens: Record<number, string> = {};

  initialize(options: UniqueSDKNFTControllerOptions): void {
    this.sdk = options.sdk;
    this.collectionIds = options.collectionIds;
    this.allowedTokens = options.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
  }

  async getAccountMarketableTokens(address: Address): Promise<TokenByIdResult[]> {
    if (!this.sdk?.api || !address) {
      return [];
    }
    const tokens: TokenByIdResult[] = [];
    // @ts-ignore
    const { unique } = this.sdk?.api.rpc || {};

    for (const collectionId of this.collectionIds) {
      try {
        const tokensIds: TokenId[] =
          await unique?.accountTokens(collectionId, { Substrate: address }) || [];
        const tokensIdsOnEth: TokenId[] =
          await unique?.accountTokens(collectionId, { Ethereum: getEthAccount(address) }) || [];

        const currentAllowedTokens = this.allowedTokens[collectionId];
        const allowedIds = filterAllowedTokens([...tokensIds, ...tokensIdsOnEth], currentAllowedTokens);
        const tokensOfCollection = (await Promise.all(allowedIds
          .map((tokenId) =>
            this.getToken(collectionId, tokenId.toNumber())))) as TokenByIdResult[];

        tokens.push(...tokensOfCollection);
      } catch (e) {
        console.log(`Wrong ID of collection ${collectionId}`, e);
      }
    }
    return tokens;
  }

  async getToken(collectionId: number, tokenId: number): Promise<TokenByIdResult | null> {
    return await this.sdk?.tokens.get_new({ collectionId, tokenId }) || null;
  }
}
