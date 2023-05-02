import { GetBundleResponse, TokenByIdResponse, TokenOwnerResponse, TokenIdQuery } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { TransactionOptions } from './types';
import { getEthAccount } from './utils/addressUtils';
import { filterAllowedTokens } from './utils/checkTokenIsAllowed';
import BaseController from './controllers/BaseController';
import { NetworkOptions } from 'api/sdk/sdkClient';
import { AllowedCollections } from 'api/restApi/settings/types';

declare module '@unique-nft/sdk' {
  type arrayNumberRecordStringAny = string | number | Record<string, string>
}

export class UniqueSDKNFTController extends BaseController {
  private allowedCollections: AllowedCollections;
  private allowedTokens: Record<number, string> = {};

  constructor(options: NetworkOptions) {
    super(options);
    this.allowedCollections = options.settings.blockchain.unique.collections;
  }

  setNetwork(options: NetworkOptions): void {
    this.allowedCollections = options.settings.blockchain.unique.collections;
    super.setNetwork(options);
  }

  async getAccountMarketableTokens(address: string): Promise<TokenByIdResponse[]> {
    if (!this.uniqueSdk || !address) {
      return [];
    }
    const tokens: TokenByIdResponse[] = [];

    for (const id in this.allowedCollections) {
      const collectionId = Number(id);
      try {
        const tokensIds =
          (await this.uniqueSdk.token.accountTokens({ collectionId, address })).tokens || [];
        const tokensIdsOnEth =
          (await this.uniqueSdk.token.accountTokens({ collectionId, address: getEthAccount(address) })).tokens || [];

        const currentAllowedTokens = this.allowedTokens[collectionId];
        const allowedIds = filterAllowedTokens([...tokensIds, ...tokensIdsOnEth], currentAllowedTokens);
        const tokensOfCollection = (await Promise.all(allowedIds
          .map(({ tokenId }) =>
            this.getToken(collectionId, tokenId)))) as TokenByIdResponse[];

        tokens.push(...tokensOfCollection);
      } catch (e) {
        console.log(`Wrong ID of collection ${collectionId}`, e);
      }
    }
    return tokens;
  }

  async getToken(collectionId: number, tokenId: number): Promise<TokenByIdResponse | null> {
    return await this.uniqueSdk.token.get({ collectionId, tokenId }) || null;
  }

  async isBundle(collectionId: number, tokenId: number): Promise<boolean> {
    return (await this.uniqueSdk.token.isBundle({ collectionId, tokenId })).isBundle;
  }

  async getBundle(collectionId: number, tokenId: number): Promise<GetBundleResponse | null> {
    return await this.uniqueSdk.token.getBundle({ collectionId, tokenId }) || null;
  }

  // TODO: fix
  async unnest(collectionId: number, tokenId: number, address: string, options: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    const parent = await this.uniqueSdk.token.parent({ collectionId, tokenId });

    if (!parent) return;

    const unsignedTxPayload = await this.uniqueSdk.token.unnest.build({
      nested: { collectionId, tokenId },
      address
    });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.token.unnest.sign(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsic.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async transferToBundle(nested: TokenIdQuery, newParent: TokenIdQuery, { account }: TransactionOptions): Promise<void> {
    const parent = await this.uniqueSdk.token.parent(nested);
    if (!parent) return;
    const { collectionId, tokenId } = nested;
    const from = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const to = Address.nesting.idsToAddress(Number(newParent.collectionId), newParent.tokenId);
    const unsignedTxPayload = await this.uniqueSdk.extrinsic.build({
      section: 'unique',
      method: 'transferFrom',
      address: account?.address || '',
      args: [
        // @ts-ignore
        { Ethereum: from },
        // @ts-ignore
        { Ethereum: to },
        collectionId,
        tokenId,
        1
      ]
    });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.extrinsic.sign(unsignedTxPayload, account.account);
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsic.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getOwner(collectionId: number, tokenId: number): Promise<TokenOwnerResponse | null> {
    return await this.uniqueSdk.token.owner({ collectionId, tokenId }) || null;
  }
}
