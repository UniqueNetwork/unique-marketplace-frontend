import { Context, Consumer, Provider, createContext } from 'react';
import { Settings } from './restApi/settings/types';
import { UniqueSDKNFTController } from './uniqueSdk/NFTController';
import { UniqueSDKCollectionController } from './uniqueSdk/collectionController';
import { UniqueSDKMarketController } from './uniqueSdk/marketController';
import { Client } from '@unique-nft/substrate-client';
import { HexString } from '@polkadot/util/types';

type Api = {
  nft?: UniqueSDKNFTController
  collection?: UniqueSDKCollectionController
  market?: UniqueSDKMarketController
}

export interface ChainProperties {
  SS58Prefix: number;
  token: string;
  decimals: number;
  wsUrl: string;
  genesisHash: HexString;
}

export type ApiContextProps = {
  api: Api | undefined
  uniqueSdk?: Client
  kusamaSdk?: Client
  chainData?: ChainProperties
  settings?: Settings
  currentChainId?: string
  baseURL: string
  onChangeChainId(chainId: string): void
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps);
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer;
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider;

export default ApiContext;

export { ApiConsumer, ApiProvider };
