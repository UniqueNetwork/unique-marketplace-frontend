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
