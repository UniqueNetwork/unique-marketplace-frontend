import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { MarketUniqueController } from './uniqueSdk/controllers/marketUniqueController'; // TODO: refactor those imports

export const sdkClient = new SdkClient();
