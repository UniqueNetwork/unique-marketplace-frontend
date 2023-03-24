import { ethers } from 'ethers';
import Web3Provider from 'web3';
import IBaseController from './IBaseController';
import UniqueController from './UniqueController';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
class MetamaskController extends UniqueController implements IBaseController {
  protected contractAddress = '';
  public provider: Web3Provider | undefined;
  public isConnected = false;

  public setProvider(provider: Web3Provider | undefined) {
    this.isConnected = false;
    if (provider) {
      this.provider = provider;
      this.isConnected = true;
      return;
    }
    const win = (window as any);
    if (!win) throw new Error('Failed to access global window');
    if (MetamaskController.checkMetamaskInstalled()) throw new Error('Metamask not allowed on page or not installed');
    this.provider =
      (window as any).ethereum && new ethers.providers.Web3Provider((window as any).ethereum);
    this.isConnected = true;
  }

  static checkMetamaskInstalled(): boolean {
    return !!(window as any)?.ethereum;
  }

  async setNetwork(options: any): Promise<void> {
    console.log('Setting network for metamask', options);
    this.contractAddress = '0xbf198C5168E6BA2ef9E58e3d674d7F7eB2DfC96e';
    await super.setNetwork(options);
    return Promise.resolve();
  }
}

export default MetamaskController;
