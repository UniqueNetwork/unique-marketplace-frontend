import { Sdk } from '@unique-nft/sdk';
import '@unique-nft/sdk/state-queries';
import { SdkExtrinsics } from '@unique-nft/sdk/extrinsics';
import { SdkTokens, SdkCollections } from '@unique-nft/sdk/tokens';
import { SdkBalance } from '@unique-nft/sdk/balance';
import './sponsorshipModule';

declare module '@unique-nft/sdk' {
  interface Sdk {
    readonly extrinsics: SdkExtrinsics;
    readonly tokens: SdkTokens;
    readonly collections: SdkCollections;
    readonly balance: SdkBalance;
  }
}

export class SdkClient {
  public sdk: Sdk | undefined;
  public isReady = false;
  public error: Error | undefined;

  constructor(url?: string) {
    if (url) { this.connect(url); }
  }

  async disconnect() {
    await this.sdk?.api.disconnect();
    this.sdk = undefined;
  }

  async connect(url: string) {
    this.sdk = await Sdk.create({ chainWsUrl: url });

    this.sdk.api.on('disconnected', () => {
      this.isReady = false;
    });

    this.sdk.api.on('error', (error: Error) => {
      this.error = error;
      this.isReady = false;
    });

    this.isReady = true;
  }
}
