import { ApiPromise } from '@polkadot/api';
import { Context, Consumer, Provider, createContext } from 'react';
import { Chain, ICollectionController, IMarketController, INFTController, IRpcClient } from './chainApi/types';

export type ChainData = {
  properties: {
    tokenSymbol: string
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
  rpcClient: IRpcClient
  rawRpcApi?: ApiPromise
  api: Api | undefined
  chainData?: ChainData
  currentChain: Chain
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps);
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer;
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider;

export default ApiContext;

export { ApiConsumer, ApiProvider };
