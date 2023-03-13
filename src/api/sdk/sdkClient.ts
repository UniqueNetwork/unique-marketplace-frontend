import { Settings } from '../restApi/settings/types';
import { UniqueSDKNFTController } from '../uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from '../uniqueSdk/collectionController';
import { UniqueSDKMarketController } from '../uniqueSdk/marketController';
import { SdkNetworkProvider } from './sdkNetworkProvider';
import { DecodedInfixOrUrlOrCidAndHash } from '../uniqueSdk/types';

declare module '@unique-nft/sdk' {
  export interface TokenByIdResponse {
    image: DecodedInfixOrUrlOrCidAndHash
    video?: DecodedInfixOrUrlOrCidAndHash
  }
}

export interface NetworkOptions { networkId: string, sdkEndpoint: string, sdkRelayEndpoint: string, settings: Settings }

export class SdkClient {
  public isReady = false;
  public networks: Record<string, SdkNetworkProvider> = {};
  public nftController: UniqueSDKNFTController = new UniqueSDKNFTController();
  public collectionController: UniqueSDKCollectionController = new UniqueSDKCollectionController();
  public marketController: UniqueSDKMarketController = new UniqueSDKMarketController();

  private addNetwork = async ({ networkId, ...networkOptions }: NetworkOptions) => {
    const network = new SdkNetworkProvider(networkOptions);
    await network.init();
    this.networks[networkId] = network;
  };

  async initialize(networkOptions: NetworkOptions[]) {
    await Promise.all(networkOptions.map(this.addNetwork));
    this.isReady = true;
  }

  setNetwork(networkId: string) {
    const { sdkSet, settings } = this.networks[networkId];

    if (!sdkSet || !settings) {
      throw new Error(`Network ${networkId} not exists`);
    }
    // changing sdk instances and settings for controllers
    this.nftController.setNetwork({
      sdk: sdkSet.unique,
      allowedTokens: settings.blockchain.unique.allowedTokens,
      collectionIds: settings.blockchain.unique.collectionIds
    });
    this.collectionController.setNetwork({
      sdk: sdkSet.unique,
      collectionIds: settings.blockchain.unique.collectionIds
    });
    this.marketController.setNetwork({
      uniqueSdk: sdkSet.unique,
      auctionAddress: settings.auction.address,
      contractAddress: settings.blockchain.unique.contractAddress
    });
  }
}
