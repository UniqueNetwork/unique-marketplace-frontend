import { Sdk } from '@unique-nft/substrate-client';
import { TokenId } from './types';
import { Settings } from '../restApi/settings/types';
import { getEthAccount } from './utils/addressUtils';
import { filterAllowedTokens } from './utils/checkTokenIsAllowed';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { Address } from '@unique-nft/substrate-client/types';

export class UniqueSDKNFTController {
  private sdk: Sdk;
  private readonly collectionIds: number[];
  private readonly allowedTokens: Record<number, string>;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.collectionIds = settings.blockchain.unique.collectionIds;
    this.allowedTokens = settings.blockchain?.unique?.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
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
    return await this.sdk.tokens.get_new({ collectionId, tokenId });
  // async getToken(collectionId: number, tokenId: number): Promise<NFTToken | null> {
  //   const token = await this.sdk.tokens.get_new({ collectionId, tokenId });
  //   const collection = await this.sdk.collections.get_new({ collectionId });
  //   if (!token || !collection) return null;
  //   const isBundle = !!await this.sdk.tokens.isBundle({ collectionId, tokenId });
  //
  //   const { owner, attributes, image, video } = token;
  //   const { name, tokenPrefix, description, schema } = collection;
  //
  //   const imageUrl = image?.fullUrl || '';
  //   const collectionCover = schema?.coverPicture?.fullUrl || '';
  //
  //   const isAllowed = this.allowedTokens[collectionId] ? checkTokenIsAllowed(tokenId, this.allowedTokens[collectionId].split(',')) : true;
  //
  //   return {
  //     id: tokenId,
  //     owner,
  //     attributes,
  //     imageUrl,
  //     collectionId,
  //     collectionName: name,
  //     prefix: tokenPrefix,
  //     description,
  //     collectionCover,
  //     isAllowed,
  //     video,
  //     isBundle,
  //     tokenDescription: {
  //       collectionName: '', // TODO fix this
  //       collectionCover: '',
  //       description: '',
  //       image: token.image,
  //       prefix: '',
  //       attributes: token.attributes
  //     }
  //   };
  }
}
