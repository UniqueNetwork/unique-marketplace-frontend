import { Settings } from '../restApi/settings/types';
import Sdk, { ChainPropertiesResponse } from '@unique-nft/sdk';

type SdkSet = { unique: Sdk };

export class SdkNetworkProvider {
  public isReady = false;
  public error: Error | undefined;
  public sdkSet: SdkSet | undefined;
  public settings: Settings;
  public uniqueProperties?: ChainPropertiesResponse;

  constructor({ sdkEndpoint, sdkRelayEndpoint, settings }: { sdkEndpoint: string, sdkRelayEndpoint: string, settings: Settings }) {
    this.settings = settings;
    this.sdkSet = {
      unique: new Sdk({ baseUrl: sdkEndpoint })
    };
  }

  async init() {
    this.uniqueProperties = await this.sdkSet?.unique.common.chainProperties()
    ;
  }
}
