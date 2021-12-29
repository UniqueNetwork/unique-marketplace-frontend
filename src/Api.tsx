import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { ApiPromise } from '@polkadot/api/promise'
import { WsProvider } from '@polkadot/rpc-provider'
import { ApiContextProps, ApiProvider, ChainData } from './context/ApiContext'
import { formatBalance } from '@polkadot/util'
import { Chain, chains } from './config'
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink } from '@apollo/client'
import { cache } from './api/client'

async function retrieve(api: ApiPromise): Promise<ChainData> {
  const [chainProperties, systemChain, systemName] = await Promise.all([
    api.rpc.system.properties(),
    api.rpc.system.chain(),
    api.rpc.system.name(),
  ])

  return {
    properties: {
      tokenSymbol: chainProperties.tokenSymbol.unwrapOr([formatBalance.getDefaults().unit])[0].toString(),
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
  const [currentChain, setCurrentChain] = useState<Chain>(chains['OPAL by UNIQUE']);
  const [client, setClient] = useState<ApolloClient<any>>(new ApolloClient({ uri: chains['OPAL by UNIQUE'].clientEndpoint, cache }))

  const value = useMemo<ApiContextProps>(
    () => ({ apiError, isApiConnected, isApiInitialized, chainData, api, currentChain, onChangeChain: setCurrentChain }),
    [apiError, isApiConnected, isApiInitialized, chainData, api, currentChain, setCurrentChain],
  )

  useEffect(() => {
    if (api) {
      api.disconnect();
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

    client.stop()
    setClient(new ApolloClient({ uri: currentChain.clientEndpoint, cache }))

  }, [currentChain])

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </ApiProvider>
  )
}

export default Api
