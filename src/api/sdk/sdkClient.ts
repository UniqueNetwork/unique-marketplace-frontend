import { Settings } from '../restApi/settings/types';
import { UniqueSDKNFTController } from '../chainApi/NFTController';
import { UniqueSDKCollectionController } from '../chainApi/collectionController';
import { SdkNetworkProvider } from './sdkNetworkProvider';
import { DecodedInfixOrUrlOrCidAndHash } from '../chainApi/types';
import MarketController from 'api/chainApi/MarketController';
import MarketUniqueController from 'api/chainApi/controllers/marketUniqueController';
import MarketMetamaskController from 'api/chainApi/controllers/marketMetamaskController';

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
  public marketController: MarketController = new MarketController(new MarketUniqueController(), new MarketMetamaskController());

  private addNetwork = async ({ networkId, ...networkOptions }: NetworkOptions) => {
    const network = new SdkNetworkProvider(networkOptions);
    await network.init();
    this.networks[networkId] = network;
  };

  async initialize(networkOptions: NetworkOptions[]) {
    await Promise.all(networkOptions.map(this.addNetwork));
    this.isReady = true;
  }

  async setNetwork(networkId: string) {
    const { sdkSet, settings } = this.networks[networkId];

    if (!sdkSet || !settings) {
      throw new Error(`Network ${networkId} not exists`);
    }
    // changing sdk instances and settings for controllers
    await this.nftController.setNetwork({
      uniqueSdk: sdkSet.unique,
      allowedTokens: settings.blockchain.unique.allowedTokens,
      collectionIds: settings.blockchain.unique.collectionIds
    });
    await this.collectionController.setNetwork({
      uniqueSdk: sdkSet.unique,
      collectionIds: settings.blockchain.unique.collectionIds
    });
    await this.marketController.setNetwork({
      uniqueSdk: sdkSet.unique,
      auctionAddress: settings.auction.address,
      contractAddress: settings.blockchain.unique.contractAddress
    });
  }
}
