import { GetBundleResponse, TokenOwnerResponse, TokenIdQuery, TopmostTokenOwnerResponse, TokenBalanceResponse, TotalPiecesResponse } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { TransactionOptions } from './types';
import BaseController from './controllers/BaseController';
import { NetworkOptions } from 'api/sdk/sdkClient';
import { AllowedCollections } from 'api/restApi/settings/types';

export class UniqueSDKRFTController extends BaseController {
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

  async getTokenBalance(collectionId: number, tokenId: number, address: string): Promise<TokenBalanceResponse | null> {
    return await this.uniqueSdk.refungible.getBalance({ collectionId, tokenId, address }) || null;
  }

  async getTokenTotalPieces(collectionId: number, tokenId: number): Promise<TotalPiecesResponse | null> {
    return await this.uniqueSdk.refungible.totalPieces({ collectionId, tokenId }) || null;
  }

  isBundle(collectionId: number, tokenId: number, address: string): boolean {
    return Address.is.nestingAddress(address);
  }

  async getBundle(collectionId: number, tokenId: number): Promise<GetBundleResponse | null> {
    return await this.uniqueSdk.token.getBundle({ collectionId, tokenId }) || null;
  }

  async getTopmostOwner(collectionId: number, tokenId: number): Promise<TopmostTokenOwnerResponse | null> {
    return await this.uniqueSdk.token.topmostOwner({ collectionId, tokenId }) || null;
  }

  async getOwner(collectionId: number, tokenId: number): Promise<TokenOwnerResponse | null> {
    return await this.uniqueSdk.token.owner({ collectionId, tokenId }) || null;
  }
}
