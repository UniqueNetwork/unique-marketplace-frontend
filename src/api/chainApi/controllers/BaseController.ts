import { MetamaskAccount } from '@unique-nft/accounts/metamask';
import { Client, Sdk } from '@unique-nft/sdk';
import { NetworkOptions } from 'api/sdk/sdkClient';
import { Account } from '@unique-nft/accounts/types';
import IMarketContractAdapter from '../adapters/IMarketContractAdapter';
import MetamaskAdapter from '../adapters/MetamaskAdapter';
import UniqueAdapter from '../adapters/UniqueAdapter';
import IBaseController from '../controllers/base/IBaseController';

class BaseController implements IBaseController {
  isConnected = false;
  uniqueSdk: Client;
  uniqueAdapter: UniqueAdapter;
  metamaskAdapter: MetamaskAdapter;
  constructor(options: NetworkOptions) {
    const contractAddress = options.settings.blockchain.unique.contractAddress;
    this.uniqueSdk = new Sdk({ baseUrl: options.sdkEndpoint });
    this.uniqueAdapter = new UniqueAdapter(contractAddress, this.uniqueSdk);
    this.metamaskAdapter = new MetamaskAdapter(contractAddress);
    this.isConnected = true;
  }

  public setNetwork(options: NetworkOptions): void {
    const sdk = this.uniqueSdk = new Sdk({ baseUrl: options.sdkEndpoint });
    this.uniqueSdk = sdk;
    this.isConnected = false;
    // TODO: base adapter doesn't need contract address (split adapters into BaseAdapter and MarketAdapter for clarity)
    const contractAddress = options.settings.blockchain.unique.contractAddress;
    this.uniqueAdapter = new UniqueAdapter(contractAddress, sdk);
    this.metamaskAdapter = new MetamaskAdapter(contractAddress);
    this.isConnected = true;
  }

  private isMetamaskSigner(account: Account): boolean {
    return account instanceof MetamaskAccount;
  }

  protected getAdapter(account: Account): IMarketContractAdapter {
    // all non-sign calls can be postponed to default unique sdk
    if (!account) {
      return this.getDefaultAdapter();
    }
    if (this.isMetamaskSigner(account)) {
      return this.metamaskAdapter;
    }
    return this.uniqueAdapter;
  }

  protected getDefaultAdapter(): IMarketContractAdapter {
    return this.uniqueAdapter;
  }
}

export default BaseController;
