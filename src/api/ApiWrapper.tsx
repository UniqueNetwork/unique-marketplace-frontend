import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { chain } from '@polkadot/types/interfaces/definitions'
import gql, { IGqlClient } from './graphQL/gqlClient'
import rpc, { chains, defaultChainId } from './chainApi/rpcClient'
import { IRpcClient } from './chainApi/types'
import { ApiContextProps, ApiProvider, ChainData } from './ApiContext'

interface ChainProviderProps {
  children: React.ReactNode
  gqlClient?: IGqlClient
  rpcClient?: IRpcClient
}

const ApiWrapper = ({ gqlClient = gql, rpcClient = rpc, children }: ChainProviderProps) => {
  const [chainData, setChainData] = useState<ChainData>()
  const { chainId } = useParams<'chainId'>()

  useEffect(() => {
    if (chainId && chains[chainId]) {
      localStorage.setItem('uniq-explorer_chain', chainId)
    }
  }, [chainId])

  const currentChain = useMemo(() => {
    if (Object.values(chain).length === 0) {
      throw new Error('Networks is not configured')
    }
    return (
      chains[chainId || ''] ||
      chains[localStorage.getItem('uniq-explorer_chain') || ''] ||
      chains[defaultChainId]
    )
  }, [chainId])

  const value = useMemo<ApiContextProps>(
    () => ({
      rpcClient,
      api: rpcClient?.controller,
      chainData,
      currentChain,
    }),
    [rpcClient, currentChain, chainData]
  )

  useEffect(() => {
    rpc.changeRpcChain(currentChain, { onChainReady: (chainData) => setChainData(chainData) })
    gql.changeRpcChain(currentChain)
  }, [currentChain])

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient.client}>{children}</ApolloProvider>
    </ApiProvider>
  )
}

export default ApiWrapper
