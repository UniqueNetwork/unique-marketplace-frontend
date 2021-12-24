import React from 'react'

export type ChainData = {
  properties: {
    tokenSymbol: string
  }
  systemChain: string;
  systemName: string;
}

export type ApiContextProps = {
  apiError: string | null;
  isApiConnected: boolean;
  isApiInitialized: boolean;
  chainData: ChainData | undefined
}

const ApiContext: React.Context<ApiContextProps> = React.createContext({} as unknown as ApiContextProps)
const ApiConsumer: React.Consumer<ApiContextProps> = ApiContext.Consumer
const ApiProvider: React.Provider<ApiContextProps> = ApiContext.Provider

export default ApiContext

export {
  ApiConsumer,
  ApiProvider,
}