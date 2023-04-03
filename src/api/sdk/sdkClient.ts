import { Settings } from '../restApi/settings/types';
import { UniqueSDKNFTController } from '../chainApi/NFTController';
import { UniqueSDKCollectionController } from '../chainApi/collectionController';
import { DecodedInfixOrUrlOrCidAndHash } from '../chainApi/types';
import MarketController from 'api/chainApi/MarketController';
import { Sdk } from '@unique-nft/sdk';

declare module '@unique-nft/sdk' {
  export interface TokenByIdResponse {
    image: DecodedInfixOrUrlOrCidAndHash
    video?: DecodedInfixOrUrlOrCidAndHash
  }
}

export interface NetworkOptions { networkId: string, sdkEndpoint: string, sdkRelayEndpoint: string, settings: Settings }

export class SdkClient {
  public isReady = false;
  // TODO: legacy, refactor into using adapters required
  public nftController: UniqueSDKNFTController;
  // TODO: legacy, refactor into using adapters required
  public collectionController: UniqueSDKCollectionController;
  public marketController: MarketController;

  constructor(options: NetworkOptions) {
    this.marketController = new MarketController(options);
    const sdk = new Sdk({ baseUrl: options.sdkEndpoint }); // TODO: remove after rework for other controllers
    this.collectionController = new UniqueSDKCollectionController(sdk);
    this.nftController = new UniqueSDKNFTController(sdk, options.settings.blockchain.unique.collectionIds, options.settings.blockchain.unique.allowedTokens);
    this.isReady = true;
  }

  async setNetwork(options: NetworkOptions): Promise<void> {
    this.isReady = false;
    const sdk = new Sdk({ baseUrl: options.sdkEndpoint });
    // TODO: refactor those controllers, make setNetwork sync operation instead
    await this.nftController.setNetwork({
      uniqueSdk: sdk,
      allowedTokens: options.settings.blockchain.unique.allowedTokens,
      collectionIds: options.settings.blockchain.unique.collectionIds
    });
    await this.collectionController.setNetwork({
      uniqueSdk: sdk,
      collectionIds: options.settings.blockchain.unique.collectionIds
    });
    // TODO: when metamask updated we must ask in extension to change network too (see wallet implementation for more)
    this.marketController.setNetwork(options);
    this.isReady = true;
  }
}
