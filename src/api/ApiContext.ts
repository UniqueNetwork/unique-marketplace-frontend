import { Context, Consumer, Provider, createContext } from 'react';
import { Settings } from './restApi/settings/types';
import { ChainProperties } from '@unique-nft/substrate-client/types';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import { Sdk } from '@unique-nft/substrate-client';

type Api = {
  nft?: UniqueSDKNFTController
  collection?: UniqueSDKCollectionController
  market?: UniqueSDKMarketController
}

export type ApiContextProps = {
  api: Api | undefined
  uniqueSdk?: Sdk
  kusamaSdk?: Sdk
  chainData?: ChainProperties
  settings?: Settings
  currentChainId?: string
  onChangeChainId(chainId: string): void
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps);
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer;
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider;

export default ApiContext;

export { ApiConsumer, ApiProvider };
