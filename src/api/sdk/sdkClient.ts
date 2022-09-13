import { Settings } from '../restApi/settings/types';
import { UniqueSDKNFTController } from '../uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from '../uniqueSdk/collectionController';
import { UniqueSDKMarketController } from '../uniqueSdk/marketController';
import { SdkNetworkProvider } from './sdkNetworkProvider';

export class SdkClient {
  public isReady = false;
  public networks: Record<string, SdkNetworkProvider> = {};
  public nftController: UniqueSDKNFTController = new UniqueSDKNFTController();
  public collectionController: UniqueSDKCollectionController = new UniqueSDKCollectionController();
  public marketController: UniqueSDKMarketController = new UniqueSDKMarketController();

  private addNetwork = async ({ networkId, settings }: { networkId: string, settings: Settings }) => {
    const network = new SdkNetworkProvider(settings);
    await network.connect();
    this.networks[networkId] = network;
    this.isReady = network.isReady;
  };

  async initialize(networkSettings: ({ networkId: string, settings: Settings })[]) {
    await Promise.all(networkSettings.map(this.addNetwork));
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
      kusamaSdk: sdkSet.kusama,
      auctionAddress: settings.auction.address,
      contractAddress: settings.blockchain.unique.contractAddress,
      escrowAddress: settings.blockchain.escrowAddress,
      wsEndpoint: settings.blockchain.unique.wsEndpoint
    });
  }
}
