import React, { FC, useEffect, useMemo, useState } from 'react'
import { ApiPromise } from '@polkadot/api/promise'
import { WsProvider } from '@polkadot/rpc-provider'
import { formatBalance } from '@polkadot/util'
import { ApolloProvider, HttpLink } from '@apollo/client'
import { ApiContextProps, ApiProvider, ChainData } from './ApiContext'
import client from '../../api/graphQL/gqlClient'
import chains, { Chain, defaultChain } from '../../chains'

async function retrieve(api: ApiPromise): Promise<ChainData> {
  const [chainProperties, systemChain, systemName] = await Promise.all([
    api.rpc.system.properties(),
    api.rpc.system.chain(),
    api.rpc.system.name(),
  ])

  return {
    properties: {
      tokenSymbol: chainProperties.tokenSymbol
        .unwrapOr([formatBalance.getDefaults().unit])[0]
        .toString(),
    },
    systemChain: (systemChain || '<unknown>').toString(),
    systemName: systemName.toString(),
  }
}

const Api: FC = ({ children }) => {
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [isApiInitialized, setIsApiInitialized] = useState(false)
  const [apiError, setApiError] = useState<null | string>(null)
  const [api, setApi] = useState<ApiPromise>()
  const [chainData, setChainData] = useState<ChainData | undefined>()
  const [currentChain, setCurrentChain] = useState<Chain>(chains[defaultChain])

  const value = useMemo<ApiContextProps>(
    () => ({
      apiError,
      isApiConnected,
      isApiInitialized,
      chainData,
      api,
      currentChain,
      onChangeChain: setCurrentChain,
    }),
    [apiError, isApiConnected, isApiInitialized, chainData, api, currentChain, setCurrentChain]
  )

  useEffect(() => {
    if (api) {
      api.disconnect()
    }

    const provider = new WsProvider(currentChain.rpcEndpoint)

    const _api = new ApiPromise({ provider })

    _api.on('connected', () => setIsApiConnected(true))
    _api.on('disconnected', () => setIsApiConnected(false))
    _api.on('error', (error: Error) => setApiError(error.message))
    _api.on('ready', (): void => {
      setIsApiConnected(true)
      retrieve(_api).then(setChainData)
    })

    setApi(_api)
    setIsApiInitialized(true)

    client.stop() // terminate all active query processes
    client.clearStore().then(() => {
      // resets the entire store by clearing out the cache
      client.setLink(new HttpLink({ uri: currentChain.clientEndpoint }))
    })
  }, [currentChain])

  console.log('hello?', value)
  return (
    <ApiProvider value={value}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </ApiProvider>
  )
}

export default Api
