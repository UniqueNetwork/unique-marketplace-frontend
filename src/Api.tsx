import React, { FC, useEffect, useMemo, useState } from 'react'
import { ApiPromise } from '@polkadot/api/promise'
import { WsProvider } from '@polkadot/rpc-provider'
import { TypeRegistry } from '@polkadot/types'
import config from './config'
import { ApiContextProps, ApiProvider, ChainData } from './context/ApiContext'
import { formatBalance } from '@polkadot/util'

const registry = new TypeRegistry()

async function retrieve(api: ApiPromise): Promise<ChainData> {
  const [chainProperties, systemChain, systemName] = await Promise.all([
    // @ts-ignore
    api.rpc.system.properties(),
    // @ts-ignore
    api.rpc.system.chain(),
    // @ts-ignore
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

  const value = useMemo<ApiContextProps>(
    () => ({ apiError, isApiConnected, isApiInitialized, chainData, api }),
    [apiError, isApiConnected, isApiInitialized, chainData, api],
  )

  useEffect(() => {
    const provider = new WsProvider(config.UNIQUE_API)

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
  }, [])

  useEffect(() => {
    console.log(chainData)
  }, [chainData])

  return (
    <ApiProvider value={value}>
      {children}
    </ApiProvider>
  )
}

export default Api
