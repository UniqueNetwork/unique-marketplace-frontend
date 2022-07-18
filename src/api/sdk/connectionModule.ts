import { Sdk, addFeature } from '@unique-nft/sdk';

class ConnectionSdkModule {
  private sdk: Sdk;
  public isReady = false;
  public error: Error | undefined;

  constructor(sdk: Sdk) {
    this.sdk = sdk;

    sdk.api.on('connected', () => {
      this.isReady = true;
    });

    sdk.api.on('disconnected', () => {
      this.isReady = false;
    });

    sdk.api.on('error', (error: Error) => {
      this.error = error;
      this.isReady = false;
    });
  }
}

declare module '@unique-nft/sdk' {
  export interface Sdk {
    connection: ConnectionSdkModule;
  }
}

addFeature('connection', ConnectionSdkModule);
