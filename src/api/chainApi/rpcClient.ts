import { ApiPromise, WsProvider } from "@polkadot/api";
import { formatBalance } from "@polkadot/util";
import chains, { Chain, defaultChain } from "../../chains";

export class RpcClient {
  public chainApi?: ApiPromise;

  public isApiConnected: boolean = false;
  public isApiInitialized: boolean = false;
  public apiError?: string; // todo: type?
  public chainData: any = undefined;
  public currentChain: Chain; // todo: use first key instead of defaultChain to avoid confusion with env variables

  constructor(chain: Chain) {
    this.currentChain = chain;
  }

  private setIsApiConnected(value: boolean) {
    this.isApiConnected = value;
  }
  private setApiError(message: string) {
    this.apiError = message;
  }
  private setApi(api: ApiPromise) {
    this.chainApi = api;
  }
  private setIsApiInitialized(value: boolean) {
    this.isApiInitialized = value;
  }
  private async getChainData() {
    if (!this.chainApi) throw new Error('Attempted to get chain data while api isn\' initialized');
    const [chainProperties, systemChain, systemName] = await Promise.all([
      this.chainApi.rpc.system.properties(),
      this.chainApi.rpc.system.chain(),
      this.chainApi.rpc.system.name(),
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

  // TODO: options for rpc chain listeners
  public changeRpcChain(chain: Chain) {
    const api = this.chainApi;
    this.currentChain = chain;
    if (api) {
      api.disconnect()
    }

    const provider = new WsProvider(this.currentChain.rpcEndpoint)

    const _api = new ApiPromise({ provider })

    _api.on('connected', () => this.setIsApiConnected(true))
    _api.on('disconnected', () => this.setIsApiConnected(false))
    _api.on('error', (error: Error) => this.setApiError(error.message))
    _api.on('ready', (): void => {
      this.setIsApiConnected(true)
      this.getChainData() // TODO: promise is running in background without any notifications about being changed
    })

    this.setApi(_api)
    this.setIsApiInitialized(true)
  }
}

const rpcClient = new RpcClient(chains[defaultChain]);

export default rpcClient;