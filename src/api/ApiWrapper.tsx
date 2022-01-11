import React, { useEffect, useMemo, useState } from 'react'
import { ApolloProvider } from '@apollo/client'
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
      gql: gqlClient,
      gqlApi: gqlClient.api,
      rpc: rpcClient,
      rpcApi: rpcClient.api,
      currentChain,
      onChangeChain: setCurrentChain,
    }),
    [gqlClient, rpcClient, currentChain, setCurrentChain]
  )

  useEffect(() => {
    rpc.changeRpcChain(currentChain)
    gql.changeRpcChain(currentChain)
  }, [currentChain])

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient.client}>{children}</ApolloProvider>
    </ApiProvider>
  )
}

export default ApiWrapper
