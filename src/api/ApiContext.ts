import { Context, Consumer, Provider, createContext } from 'react';
import { ICollectionController, IMarketController, INFTController } from './uniqueSdk/types';
import { IRpcClient } from './chainApi/types';
import { Settings } from './restApi/settings/types';
import { Sdk } from '@unique-nft/sdk';
import { ChainProperties } from '@unique-nft/sdk/types';
import { ApiPromise } from '@polkadot/api';

export type ChainData = {
  properties: {
    tokenSymbol: string
    ss58Format: number
  }
  systemChain: string
  systemName: string
}

type Api = {
  nft?: INFTController<any, any>
  collection?: ICollectionController<any, any>
  market?: IMarketController
}

export type ApiContextProps = {
  // TODO: remove this
  rpcClient: IRpcClient
  rawRpcApi?: ApiPromise
  rawKusamaRpcApi?: ApiPromise
  uniqueSdk?: Sdk
  api: Api | undefined
  chainData?: ChainProperties
  settings?: Settings
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps);
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer;
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider;

export default ApiContext;

export { ApiConsumer, ApiProvider };
