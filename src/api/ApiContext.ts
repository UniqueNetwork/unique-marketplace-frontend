import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ApiPromise } from '@polkadot/api'
import { Context, Consumer, Provider, createContext } from 'react'
import { Chain } from '../chains'
import { RpcClient } from './chainApi/rpcClient'

export type ChainData = {
  properties: {
    tokenSymbol: string
  }
  systemChain: string;
  systemName: string;
}

export type ApiContextProps = {
  rpc: RpcClient
  rpcApi: ApiPromise | undefined
  gql: ApolloClient<NormalizedCacheObject> 
  // gqlApi TODO: create gqlApi to contain all gql queries
  currentChain: Chain | undefined
  onChangeChain: (chain: Chain) => void
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps)
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider

export default ApiContext

export {
  ApiConsumer,
  ApiProvider,
}