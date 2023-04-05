import { NetworkOptions } from 'api/sdk/sdkClient';

interface IBaseController {
  isConnected: boolean;
  setNetwork(options: NetworkOptions): void
}

export default IBaseController;
