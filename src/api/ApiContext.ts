import { Context, Consumer, Provider, createContext } from 'react';
import { Settings } from './restApi/settings/types';
import { UniqueSDKNFTController } from './chainApi/NFTController';
import { UniqueSDKCollectionController } from './chainApi/collectionController';
import { ChainPropertiesResponse, Sdk } from '@unique-nft/sdk/full';
import MarketController from './chainApi/MarketController';

type Api = {
  nft?: UniqueSDKNFTController
  collection?: UniqueSDKCollectionController
  market?: MarketController
}

export type ApiContextProps = {
  api: Api | undefined
  uniqueSdk?: Sdk
  kusamaSdk?: Sdk
  chainData?: ChainPropertiesResponse
  settings?: Settings
  currentChainId?: string
  prefixes: number[]
  baseURL: string
  onChangeChainId(chainId: string): void
  refetchSettings(): Promise<void>
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps);
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer;
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider;

export default ApiContext;

export { ApiConsumer, ApiProvider };
