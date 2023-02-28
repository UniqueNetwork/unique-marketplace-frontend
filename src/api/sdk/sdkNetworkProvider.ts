import { Settings } from '../restApi/settings/types';
import { Sdk, Client, ChainPropertiesResponse } from '@unique-nft/sdk';

type SdkSet = { unique: Client, kusama: Client };

export class SdkNetworkProvider {
  public isReady = false;
  public error: Error | undefined;
  public sdkSet: SdkSet | undefined;
  public settings: Settings;
  public prefix: number | undefined;

  constructor({ sdkEndpoint, sdkRelayEndpoint, settings }: { sdkEndpoint: string, sdkRelayEndpoint: string, settings: Settings }) {
    this.settings = settings;
    this.sdkSet = {
      unique: new Sdk({ baseUrl: sdkEndpoint }),
      kusama: new Sdk({ baseUrl: sdkRelayEndpoint })
    };
  }

    this.prefix = this.sdkSet.unique.chainProperties().SS58Prefix;

    this.isReady = true;
  }
}
