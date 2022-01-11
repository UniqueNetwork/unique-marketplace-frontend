import { Context, Consumer, Provider, createContext } from 'react'
import { Chain } from '../../chains'

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