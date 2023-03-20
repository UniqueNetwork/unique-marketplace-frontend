import { ethers } from 'ethers';
import Web3Provider from 'web3';
import IBaseController from './IBaseController';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
class MetamaskController implements IBaseController {
  public provider: Web3Provider | undefined;

  public setProvider(provider: Web3Provider | undefined) {
    if (provider) {
      this.provider = provider;
      return;
    }
    const win = (window as any);
    if (!win) throw new Error('Failed to access global window');
    if (MetamaskController.checkMetamaskInstalled()) throw new Error('Metamask not allowed on page or not installed');
    this.provider =
      (window as any).ethereum && new ethers.providers.Web3Provider((window as any).ethereum);
  }

  static checkMetamaskInstalled(): boolean {
    return !!(window as any)?.ethereum;
  }

  async setNetwork(options: any): Promise<void> {
    // metamask network is stored inside metamask!?
    // TODO: figure this out
  }
}

export default MetamaskController;
