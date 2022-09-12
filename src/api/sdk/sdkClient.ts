import { Sdk } from '@unique-nft/substrate-client';
import '@unique-nft/substrate-client/state-queries';
import { SdkExtrinsics } from '@unique-nft/substrate-client/extrinsics';
import { SdkTokens, SdkCollections } from '@unique-nft/substrate-client/tokens';
import { SdkBalance } from '@unique-nft/substrate-client/balance';
import { Settings } from '../restApi/settings/types';

declare module '@unique-nft/substrate-client' {
  interface Sdk {
    readonly extrinsics: SdkExtrinsics;
    readonly tokens: SdkTokens;
    readonly collections: SdkCollections;
    readonly balance: SdkBalance;
  }
}

type SdkSet = { unique: Sdk, kusama: Sdk };

export class SdkNetworkProvider {
  public isReady = false;
  public error: Error | undefined;
  public sdkSet: SdkSet | undefined;
  public settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async disconnect() {
    await this.sdkSet?.unique.api.disconnect();
    await this.sdkSet?.kusama.api.disconnect();
    this.isReady = false;
  }

  private async createSdkInstance(url: string) {
    const sdk = await Sdk.create({ chainWsUrl: url });

    sdk.api.on('disconnected', () => {
      this.isReady = false;
    });

    sdk.api.on('error', (error: Error) => {
      this.error = error;
      this.isReady = false;
    });
    return sdk;
  }

  async connect() {
    this.isReady = false;
    this.sdkSet = {
      unique: await this.createSdkInstance(this.settings.blockchain.unique.wsEndpoint),
      kusama: await this.createSdkInstance(this.settings.blockchain.kusama.wsEndpoint)
    };

    this.isReady = true;
  }
}

export class SdkClient {
  public isReady = false;
  public networks: Record<string, SdkNetworkProvider> = {};

  async addNetwork(networkId: string, settings: Settings) {
    const network = new SdkNetworkProvider(settings);
    await network.connect();
    this.networks[networkId] = network;
    this.isReady = network.isReady;
  }
}
