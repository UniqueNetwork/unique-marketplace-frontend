import { GetBundleResponse, TokenByIdResponse, TokenOwnerResponse, TokenIdQuery, TopmostTokenOwnerResponse, TokenChildrenResponse, TokenId, CreateTokenPayload } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { CollectionMode, TransactionOptions } from './types';
import { getEthAccount } from './utils/addressUtils';
import { filterAllowedTokens } from './utils/checkTokenIsAllowed';
import BaseController from './controllers/BaseController';
import { NetworkOptions } from 'api/sdk/sdkClient';
import { AllowedCollections } from 'api/restApi/settings/types';
import { UniqueCollectionSchemaDecoded } from '@unique-nft/schemas';

declare module '@unique-nft/sdk' {
  type arrayNumberRecordStringAny = string | number | Record<string, string>
}

export class UniqueSDKNFTController extends BaseController {
  private allowedCollections: AllowedCollections;
  private allowedTokens: Record<number, string> = {};
  public decimals = 18; // TODO: move from controller to API

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

  async getChildren(collectionId: number, tokenId: number): Promise<TokenChildrenResponse | null> {
    return await this.uniqueSdk.token.children({ collectionId, tokenId }) || null;
  }

  async getTopmostOwner(collectionId: number, tokenId: number): Promise<TopmostTokenOwnerResponse | null> {
    return await this.uniqueSdk.token.topmostOwner({ collectionId, tokenId }) || null;
  }

  async getTransferToBundleFee(address: string, nested: TokenIdQuery, newParent: TokenIdQuery, mode: CollectionMode, amount: number, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    const rawFee = await adapter.getNestTokenFee(
      address,
      { collectionId: Number(nested.collectionId), tokenId: nested.tokenId },
      { collectionId: Number(newParent.collectionId), tokenId: newParent.tokenId },
      mode,
      amount,
      account.signer
    );
    return this.getChainValue(rawFee, this.decimals).parsed.toString();
  }

  async transferToBundle(address: string, nested: TokenIdQuery, newParent: TokenIdQuery, mode: CollectionMode, amount: number, { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.nestToken(
      address,
      { collectionId: Number(nested.collectionId), tokenId: nested.tokenId },
      { collectionId: Number(newParent.collectionId), tokenId: newParent.tokenId },
      mode,
      amount,
      account.signer
    );
  }

  async getUnnestFee(collectionId: number, tokenId: number, parentAddress: string, mode: CollectionMode, amount: number, { account }: TransactionOptions): Promise<string> {
    const parent = Address.nesting.addressToIds(parentAddress);

    if (!parent) return '0';

    const adapter = this.getAdapter(account);
    const rawFee = await adapter.getUnnestTokenFee({ collectionId, tokenId }, parent, mode, amount, account);
    return this.getChainValue(rawFee, this.decimals).parsed.toString();
  }

  async unnest(collectionId: number, tokenId: number, parentAddress: string, mode: CollectionMode, amount: number, { account }: TransactionOptions): Promise<void> {
    const parent = Address.nesting.addressToIds(parentAddress); // await this.uniqueSdk.token.parent({ collectionId, tokenId });

    if (!parent) return;

    const adapter = this.getAdapter(account);
    await adapter.unnestToken({ collectionId, tokenId }, parent, mode, amount, account.signer);
  }

  async getOwner(collectionId: number, tokenId: number): Promise<TokenOwnerResponse | null> {
    return await this.uniqueSdk.token.owner({ collectionId, tokenId }) || null;
  }

  async getTokensOfCollection(collectionId: number, address: string): Promise<TokenByIdResponse[]> {
    try {
      const tokensIds =
        (await this.uniqueSdk.token.accountTokens({ collectionId, address })).tokens || [];
      const tokensIdsOnEth =
        (await this.uniqueSdk.token.accountTokens({ collectionId, address: getEthAccount(address) })).tokens || [];

      const currentAllowedTokens = this.allowedTokens[collectionId];
      const allowedIds = filterAllowedTokens([...tokensIds, ...tokensIdsOnEth], currentAllowedTokens);
      return (await Promise.all(allowedIds
        .map(({ tokenId }) =>
          this.getToken(collectionId, tokenId)))) as TokenByIdResponse[];
    } catch (e) {
      console.log(`Wrong ID of collection ${collectionId}`, e);
    }
    return [];
  }

  async transferTokensBatch(transfers: {token: TokenId, from: string, to: string, amount: number, mode: CollectionMode }[], { account, onSubmittedOne }: TransactionOptions & { onSubmittedOne?(token: TokenId, index: number): void }): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.transferTokensBatch(transfers, account.signer, onSubmittedOne);
  }

  async create(payload: { tokens: CreateTokenPayload[], collectionId: number, schema?: UniqueCollectionSchemaDecoded }, { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.createTokens(payload, account.signer);
  }

  async burn(payload: { collectionId: number, tokenId: number }, { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.burn(payload, account.signer);
  }
}
