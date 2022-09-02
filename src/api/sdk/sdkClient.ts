import { Sdk } from '@unique-nft/substrate-client';
import '@unique-nft/substrate-client/state-queries';
import { SdkExtrinsics } from '@unique-nft/substrate-client/extrinsics';
import { SdkTokens, SdkCollections } from '@unique-nft/substrate-client/tokens';
import { SdkBalance } from '@unique-nft/substrate-client/balance';
import './sponsorshipModule';

declare module '@unique-nft/substrate-client' {
  interface Sdk {
    readonly extrinsics: SdkExtrinsics;
    readonly tokens: SdkTokens;
    readonly collections: SdkCollections;
    readonly balance: SdkBalance;
  }
}

type SdkSet = {
  [chainId: string]: { unique: Sdk, kusama: Sdk }
};

export class SdkClient {
  public isReady = false;
  public error: Error | undefined;
  public sdkSet: SdkSet = {};

  async disconnect(chainId: string) {
    await this.sdkSet[chainId]?.unique.api.disconnect();
    await this.sdkSet[chainId]?.kusama.api.disconnect();
    delete this.sdkSet[chainId];
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

  async connect(chainId: string, uniqueWsUrl: string, kusamaWsUrl: string) {
    this.isReady = false;
    const sdkPair = {
      unique: await this.createSdkInstance(uniqueWsUrl),
      kusama: await this.createSdkInstance(kusamaWsUrl)
    };

    this.sdkSet = {
      ...this.sdkSet,
      [chainId]: sdkPair
    };

    this.isReady = true;
  }
}
