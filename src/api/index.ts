import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';

export const nftController = new UniqueSDKNFTController();
export const collectionController = new UniqueSDKCollectionController();
export const marketController = new UniqueSDKMarketController();

export const sdkClient = new SdkClient();
