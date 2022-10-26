import { Client } from '@unique-nft/substrate-client';
import { Settings } from '../restApi/settings/types';
import '@unique-nft/substrate-client/state-queries';

type SdkSet = { unique: Client, kusama: Client };

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

  private async createClientInstance(url: string) {
    const client = await Client.create({ chainWsUrl: url });

    client.api.on('disconnected', () => {
      this.isReady = false;
    });

    client.api.on('error', (error: Error) => {
      this.error = error;
      this.isReady = false;
    });
    return client;
  }

  async connect() {
    this.isReady = false;
    this.sdkSet = {
      unique: await this.createClientInstance(this.settings.blockchain.unique.wsEndpoint),
      kusama: await this.createClientInstance(this.settings.blockchain.kusama.wsEndpoint)
    };

    this.isReady = true;
  }
}
