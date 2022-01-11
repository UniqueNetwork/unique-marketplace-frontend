import React, { useEffect, useMemo, useState } from 'react'
import { ApolloProvider, HttpLink } from '@apollo/client'
import gql from './graphQL/gqlClient'
import rpc, { RpcClient } from './chainApi/rpcClient'
import { Chain } from '../chains'
import { ApiContextProps, ApiProvider } from './ApiContext'

interface ChainProviderProps {
  children: any
  gqlClient?: any
  rpcClient?: RpcClient
}

const ApiWrapper = ({ gqlClient = gql, rpcClient = rpc, children }: ChainProviderProps) => {
  const [currentChain, setCurrentChain] = useState<Chain>(rpc.currentChain)

  const value = useMemo<ApiContextProps>(
    () => ({
      gql: gqlClient, // TODO: replace with api instead (gql.blocks.getAllBlocks(blablabla))
      rpc: rpcClient,
      rpcApi: rpcClient.chainApi,
      currentChain,
      onChangeChain: setCurrentChain,
    }),
    [gqlClient, rpcClient, currentChain, setCurrentChain]
  )

  useEffect(() => {
    rpc.changeRpcChain(currentChain)
    // TODO: put inside our gqlClient/gqlApi
    gql.stop() // terminate all active query processes
    gql.clearStore().then(() => {
      // resets the entire store by clearing out the cache
      gql.setLink(new HttpLink({ uri: currentChain.clientEndpoint }))
    })
  }, [currentChain])

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient}>{children}</ApolloProvider>
    </ApiProvider>
  )
}

export default ApiWrapper
