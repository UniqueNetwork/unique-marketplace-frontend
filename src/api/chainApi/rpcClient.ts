import { ApiPromise, WsProvider } from '@polkadot/api'
import { formatBalance } from '@polkadot/util'
import { OverrideBundleType } from '@polkadot/types/types'
import { ChainData } from '../ApiContext'
import { IRpcClient, INFTController, Chain } from './types'
import bundledTypesDefinitions from './unique/bundledTypesDefinitions'
import rpcMethods from './unique/rpcMethods'
import UniqueNFT from './unique/unique'
import { chains, defaultChainId } from '../index'

export class RpcClient implements IRpcClient {
  private rawRpcApi?: ApiPromise
  public controller?: INFTController<any, any>
  public isApiConnected: boolean = false
  public isApiInitialized: boolean = false
  public apiError?: string
  public chainData: any = undefined
  public rpcEndpoint: string

  constructor(initialChain: Chain) {
    this.rpcEndpoint = initialChain.rpcEndpoint
  }

  private setIsApiConnected(value: boolean) {
    this.isApiConnected = value
  }
  private setApiError(message: string) {
    this.apiError = message
  }

  private setApi(api: ApiPromise) {
    this.rawRpcApi = api
    this.controller = new UniqueNFT(api)
  }

  private setIsApiInitialized(value: boolean) {
    this.isApiInitialized = value
  }
  private async getChainData() {
    if (!this.rawRpcApi) throw new Error("Attempted to get chain data while api isn't initialized")
    const [chainProperties, systemChain, systemName] = await Promise.all([
      this.rawRpcApi.rpc.system.properties(),
      this.rawRpcApi.rpc.system.chain(),
      this.rawRpcApi.rpc.system.name(),
    ])

    this.chainData = {
      properties: {
        tokenSymbol: chainProperties.tokenSymbol
          .unwrapOr([formatBalance.getDefaults().unit])[0]
          .toString(),
      },
      systemChain: (systemChain || '<unknown>').toString(),
      systemName: systemName.toString(),
    }
  }

  public changeRpcChain(chain: Chain, options: { onChainReady: (chainData: ChainData) => void }) {
    this.rpcEndpoint = chain.rpcEndpoint
    if (this.rawRpcApi) {
      this.rawRpcApi.disconnect()
    }

    const typesBundle: OverrideBundleType = {
      spec: {
        nft: bundledTypesDefinitions,
      },
    }

    const provider = new WsProvider(this.rpcEndpoint)

    const _api = new ApiPromise({
      provider,
      rpc: {
        unique: rpcMethods,
      },
      // @ts-ignore
      typesBundle,
    })

    _api.on('connected', () => this.setIsApiConnected(true))
    _api.on('disconnected', () => this.setIsApiConnected(false))
    _api.on('error', (error: Error) => this.setApiError(error.message))
    _api.on('ready', (): void => {
      this.setIsApiConnected(true)
      this.getChainData().then(() => options.onChainReady(this.chainData))
    })

    this.setApi(_api)
    this.setIsApiInitialized(true)
  }
}

const rpcClient = new RpcClient(chains[defaultChainId])

export default rpcClient
