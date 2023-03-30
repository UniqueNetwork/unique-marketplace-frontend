import { SdkClient } from './sdk/sdkClient';
import { UniqueSDKNFTController } from './chainApi/NFTController';
import { UniqueSDKCollectionController } from './chainApi/collectionController';
import { MarketUniqueController } from './chainApi/controllers/marketUniqueController'; // TODO: refactor those imports

export const sdkClient = new SdkClient();
