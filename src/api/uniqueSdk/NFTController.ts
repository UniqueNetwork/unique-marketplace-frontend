import { Client, GetBundleResponse, TokenByIdResponse, TokenOwnerResponse } from '@unique-nft/sdk';
import { Address } from '@unique-nft/substrate-client/types';
import { getNestingTokenAddress, TokenIdArguments } from '@unique-nft/substrate-client/tokens';
import { TransactionOptions } from './types';
import { getEthAccount } from './utils/addressUtils';
import { filterAllowedTokens } from './utils/checkTokenIsAllowed';
import UniqueController from './controllers/base/UniqueController';

declare module '@unique-nft/sdk' {
  type arrayNumberRecordStringAny = string | number | Record<string, string>
}

type UniqueSDKNFTControllerOptions = { sdk: Client, collectionIds: number[], allowedTokens: { collection: number, tokens: string }[] };

export class UniqueSDKNFTController implements UniqueController {
  public uniqueSdk: Client;
  private collectionIds: number[] = [];
  private allowedTokens: Record<number, string> = {};

  // TODO: proper initialization in Api
  constructor(sdk: Client = new Client({ baseUrl: '' })) {
    this.uniqueSdk = sdk;
  }

  async setNetwork(options: UniqueSDKNFTControllerOptions): Promise<void> {
    this.uniqueSdk = options.sdk;
    this.collectionIds = options.collectionIds;
    this.allowedTokens = options.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
    // just a stub
    return await new Promise(() => {});
  }

  async getAccountMarketableTokens(address: Address): Promise<TokenByIdResponse[]> {
    if (!this.uniqueSdk || !address) {
      return [];
    }
    const tokens: TokenByIdResponse[] = [];

    for (const collectionId of this.collectionIds) {
      try {
        const tokensIds =
          (await this.uniqueSdk.tokens.accountTokens({ collectionId, address })).tokens || [];
        const tokensIdsOnEth =
          (await this.uniqueSdk.tokens.accountTokens({ collectionId, address: getEthAccount(address) })).tokens || [];

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
    return await this.uniqueSdk?.tokens.get({ collectionId, tokenId }) || null;
  }

  async isBundle(collectionId: number, tokenId: number): Promise<boolean> {
    return !!await this.uniqueSdk?.tokens.isBundle({ collectionId, tokenId });
  }

  async getBundle(collectionId: number, tokenId: number): Promise<GetBundleResponse | null> {
    return await this.uniqueSdk?.tokens.getBundle({ collectionId, tokenId }) || null;
  }

  async unnest(collectionId: number, tokenId: number, address: string, { signer }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    const parent = await this.uniqueSdk?.tokens.parent({ collectionId, tokenId });

    if (!parent) return;

    const unsignedTxPayload = await this.uniqueSdk.tokens.unnest.build({
      nested: { collectionId, tokenId },
      address
    });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.tokens.unnest.sign(unsignedTxPayload);
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async transferToBundle(nested: TokenIdArguments, newParent: TokenIdArguments, { signer }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    const parent = await this.uniqueSdk.tokens.parent(nested);
    if (!parent) return;
    const { collectionId, tokenId } = nested;
    const from = getNestingTokenAddress(parent.collectionId, parent.tokenId);
    const to = getNestingTokenAddress(newParent.collectionId, newParent.tokenId);
    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      section: 'unique',
      method: 'transferFrom',
      address: signer?.getAddress() || '',
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
    const { signature } = await this.uniqueSdk.extrinsics.sign(unsignedTxPayload, signer);
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk?.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getOwner(collectionId: number, tokenId: number): Promise<TokenOwnerResponse | null> {
    return await this.uniqueSdk?.tokens.owner({ collectionId, tokenId }) || null;
  }
}
