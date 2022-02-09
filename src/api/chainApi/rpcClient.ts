import { ApiPromise, WsProvider } from '@polkadot/api';
import { formatBalance } from '@polkadot/util';
import { OverrideBundleType } from '@polkadot/types/types';

import { IRpcClient, INFTController, IRpcClientOptions, ICollectionController } from './types';
import bundledTypesDefinitions from './unique/bundledTypesDefinitions';
import rpcMethods from './unique/rpcMethods';
import UniqueNFTController from './unique/NFTController';
import UniqueCollectionController from './unique/collectionController';
import { ChainData } from '../ApiContext';

export class RpcClient implements IRpcClient {
  public nftController?: INFTController<any, any>;
  public collectionController?: ICollectionController<any, any>;
  public rawRpcApi?: ApiPromise;
  public isApiConnected = false;
  public isApiInitialized = false;
  public apiError?: string;
  public chainData: any = undefined;
  public rpcEndpoint: string;
  private options: IRpcClientOptions;

  constructor(rpcEndpoint: string, options?: IRpcClientOptions) {
    this.rpcEndpoint = rpcEndpoint;
    this.options = options || {};
    this.setApi();
  }

  private setIsApiConnected(value: boolean) {
    this.isApiConnected = value;
  }

  private setApiError(message: string) {
    this.apiError = message;
  }

  private setIsApiInitialized(value: boolean) {
    this.isApiInitialized = value;
  }

  private setApi() {
    if (this.rawRpcApi) {
      this.setIsApiConnected(false);
      this.rawRpcApi.disconnect();
    }

    const typesBundle: OverrideBundleType = {
      spec: {
        nft: bundledTypesDefinitions
      }
    };

    const provider = new WsProvider(this.rpcEndpoint);

    const _api = new ApiPromise({
      provider,
      rpc: {
        unique: rpcMethods
      },
      // @ts-ignore
      typesBundle
    });

    _api.on('connected', () => this.setIsApiConnected(true));
    _api.on('disconnected', () => this.setIsApiConnected(false));
    _api.on('error', (error: Error) => this.setApiError(error.message));

    _api.on('ready', async () => {
      this.setIsApiConnected(true);
      await this.getChainData();
      if (this.options.onChainReady) this.options.onChainReady(this.chainData);
    });

    this.rawRpcApi = _api;
    this.nftController = new UniqueNFTController(_api);
    this.collectionController = new UniqueCollectionController(_api);
    this.setIsApiInitialized(true);
  }

  private async getChainData() {
    if (!this.rawRpcApi) throw new Error("Attempted to get chain data while api isn't initialized");
    const [chainProperties, systemChain, systemName] = await Promise.all([
      this.rawRpcApi.rpc.system.properties(),
      this.rawRpcApi.rpc.system.chain(),
      this.rawRpcApi.rpc.system.name()
    ]);

    this.chainData = {
      properties: {
        tokenSymbol: chainProperties.tokenSymbol
          .unwrapOr([formatBalance.getDefaults().unit])[0]
          .toString()
      },
      systemChain: (systemChain || '<unknown>').toString(),
      systemName: systemName.toString()
    };
  }

  public setOnChainReadyListener(callback: (chainData: ChainData) => void) {
    this.options.onChainReady = callback;
  }

  public changeEndpoint(rpcEndpoint: string, options?: IRpcClientOptions) {
    this.rpcEndpoint = rpcEndpoint;
    this.options.onChainReady = options?.onChainReady;
    this.setApi();
  }
}

export default RpcClient;
