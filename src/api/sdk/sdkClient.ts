import { Settings } from '../restApi/settings/types';
import { UniqueSDKNFTController } from '../chainApi/NFTController';
import { UniqueSDKCollectionController } from '../chainApi/collectionController';
import { DecodedInfixOrUrlOrCidAndHash } from '../chainApi/types';
import MarketController from 'api/chainApi/MarketController';

declare module '@unique-nft/sdk' {
  export interface TokenByIdResponse {
    image: DecodedInfixOrUrlOrCidAndHash
    video?: DecodedInfixOrUrlOrCidAndHash
  }
}

export interface NetworkOptions { networkId: string, settings: Settings }

export class SdkClient {
  public isReady = false;
  public nftController: UniqueSDKNFTController;
  public collectionController: UniqueSDKCollectionController;
  public marketController: MarketController;

  constructor(options: NetworkOptions) {
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
