import { Client } from '@unique-nft/sdk';
import IBaseController from './IBaseController';

export type UniqueControllerOptions = {
  uniqueSdk: Client
}

class UniqueController implements IBaseController {
  public uniqueSdk: Client;
  public isConnected = false;
  public decimals = 12; // TODO: MOVE TO API

  constructor(sdk: Client | undefined = undefined) {
    if (!sdk) {
      this.uniqueSdk = new Client({ baseUrl: '' });
      return;
    }
    this.uniqueSdk = sdk;
    this.isConnected = true;
  }

  async setNetwork(options: UniqueControllerOptions): Promise<void> {
    const sdk = options.uniqueSdk;
    this.isConnected = false;
    if (!sdk) return;
    this.uniqueSdk = sdk;
    this.decimals = (await this.uniqueSdk.common.chainProperties()).decimals || 12;
    this.isConnected = true;
  }
}

export default UniqueController;
