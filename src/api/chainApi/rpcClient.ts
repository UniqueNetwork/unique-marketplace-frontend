import { ApiPromise, WsProvider } from '@polkadot/api'
import { formatBalance } from '@polkadot/util'
import { OverrideBundleType } from '@polkadot/types/types'
import { IRpcClient, INFTController, Chain, IRpcClientOptions } from './types'
import bundledTypesDefinitions from './unique/bundledTypesDefinitions'
import rpcMethods from './unique/rpcMethods'
import UniqueNFTController from './unique/unique'
import config from '../../config'

export class RpcClient implements IRpcClient {
  public controller?: INFTController<any, any>
  public rawRpcApi?: ApiPromise
  public isApiConnected: boolean = false
  public isApiInitialized: boolean = false
  public apiError?: string
  public chainData: any = undefined
  public rpcEndpoint: string

  constructor(rpcEndpoint: string) {
    this.rpcEndpoint = rpcEndpoint
  }

  private setIsApiConnected(value: boolean) {
    this.isApiConnected = value
  }
  private setApiError(message: string) {
    this.apiError = message
  }
  private setIsApiInitialized(value: boolean) {
    this.isApiInitialized = value
  }
  private setApi(options: IRpcClientOptions) {
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
    this.rawRpcApi = _api
    this.controller = new UniqueNFTController(_api)
    this.setIsApiInitialized(true)
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

  public changeRpcChain(rpcEndpoint: string, options: IRpcClientOptions) {
    this.rpcEndpoint = rpcEndpoint
    this.setApi(options)
  }
}

const rpcClient = new RpcClient(config.defaultChain.rpcEndpoint)

export default rpcClient
