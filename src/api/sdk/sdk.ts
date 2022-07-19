import { Sdk } from '@unique-nft/sdk';
import '@unique-nft/sdk/state-queries';
import { SdkExtrinsics } from '@unique-nft/sdk/extrinsics';
import { SdkTokens, SdkCollections } from '@unique-nft/sdk/tokens';
import { SdkBalance } from '@unique-nft/sdk/balance';
import './connectionModule';
import './sponsorshipModule';

declare module '@unique-nft/sdk' {
  interface Sdk {
    readonly extrinsics: SdkExtrinsics;
    readonly tokens: SdkTokens;
    readonly collections: SdkCollections;
    readonly balance: SdkBalance;
  }
}

export const SDKFactory = async (chainWsUrl: string) => {
  return await Sdk.create({ chainWsUrl });
};
