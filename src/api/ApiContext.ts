import { ApiPromise } from '@polkadot/api'
import { Context, Consumer, Provider, createContext } from 'react'
import { Chain } from '../chains'
import { IRpcClient } from './chainApi/rpcClient'
import { GqlApi } from './graphQL/gqlApi'
import { IGqlClient } from './graphQL/gqlClient'

export type ChainData = {
  properties: {
    tokenSymbol: string
  }
  systemChain: string;
  systemName: string;
}

export type ApiContextProps = {
  rpc: IRpcClient
  rpcApi: ApiPromise
  gql: IGqlClient
  gqlApi: GqlApi,
  currentChain: Chain
}

const ApiContext: Context<ApiContextProps> = createContext({} as unknown as ApiContextProps)
const ApiConsumer: Consumer<ApiContextProps> = ApiContext.Consumer
const ApiProvider: Provider<ApiContextProps> = ApiContext.Provider

export default ApiContext

export {
  ApiConsumer,
  ApiProvider,
}