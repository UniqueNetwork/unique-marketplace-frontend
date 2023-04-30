import MarketController from 'api/chainApi/MarketController';
import { Sdk } from '@unique-nft/sdk/full';

import { Settings } from '../restApi/settings/types';
import { UniqueSDKNFTController } from '../chainApi/NFTController';
import { UniqueSDKCollectionController } from '../chainApi/collectionController';

// declare module '@unique-nft/sdk' {
//   export interface TokenByIdResponse {
//     image: DecodedInfixOrUrlOrCidAndHash
//     video?: DecodedInfixOrUrlOrCidAndHash
//   }
// }

export interface NetworkOptions { networkId: string, settings: Settings }

export class SdkClient {
  public isReady = false;
  public sdk: Sdk;
  public nftController: UniqueSDKNFTController;
  public collectionController: UniqueSDKCollectionController;
  public marketController: MarketController;

  constructor(options: NetworkOptions) {
    this.sdk = new Sdk({ baseUrl: options.settings.blockchain.unique.restUrl });
    this.marketController = new MarketController(options);
    this.collectionController = new UniqueSDKCollectionController(options);
    this.nftController = new UniqueSDKNFTController(options);
    this.isReady = true;
  }

  setNetwork(options: NetworkOptions): void {
    this.isReady = false;
    this.nftController.setNetwork(options);
    this.collectionController.setNetwork(options);
    // TODO: when metamask updated we must ask in extension to change network too (see wallet implementation for more)
    this.marketController.setNetwork(options);
    this.isReady = true;
  }
}
