import { MetamaskAccount } from '@unique-nft/accounts/metamask';
import { Sdk } from '@unique-nft/sdk/full';
import { NetworkOptions } from 'api/sdk/sdkClient';
import { Account } from '@unique-nft/accounts/types';
import IMarketContractAdapter from '../adapters/IMarketContractAdapter';
import MetamaskAdapter from '../adapters/MetamaskAdapter';
import UniqueAdapter from '../adapters/UniqueAdapter';
import IBaseController from '../controllers/base/IBaseController';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { changeMetamaskChain } from 'utils/metamask';
import { EthereumChainParams } from 'account/constants';

export type ChainValue = {
  raw: string;
  parsed: number;
}

class BaseController implements IBaseController {
  isConnected = false;
  uniqueSdk: Sdk;
  uniqueAdapter: UniqueAdapter;
  metamaskAdapter: MetamaskAdapter;
  networkId: string;

  constructor(options: NetworkOptions) {
    this.uniqueSdk = new Sdk({ baseUrl: options.settings.blockchain.unique.restUrl });
    this.uniqueAdapter = new UniqueAdapter(this.uniqueSdk);
    this.metamaskAdapter = new MetamaskAdapter();
    this.isConnected = true;
    this.networkId = options.networkId;
  }

  protected getChainValue(value: BN | number | string, decimals: number): ChainValue {
    switch (value.constructor) {
      case BN:
        return {
          raw: value.toString(),
          parsed: Number(ethers.utils.formatUnits(value.toString(), decimals).toString())
        };
      case Number:
        return {
          raw: (new BN(value).mul(new BN(10).pow(new BN(decimals)))).toString(),
          parsed: value as number
        };
      case String:
        return {
          raw: value as string,
          parsed: Number(ethers.utils.formatUnits(value.toString(), decimals).toString())
        };
      default:
        throw new Error('Invalid amount format for transfer balance');
    }
  }

  public setNetwork(options: NetworkOptions): void {
    const sdk = this.uniqueSdk = new Sdk({ baseUrl: options.settings.blockchain.unique.restUrl });
    this.uniqueSdk = sdk;
    this.isConnected = false;
    this.uniqueAdapter = new UniqueAdapter(sdk);
    this.metamaskAdapter = new MetamaskAdapter();
    this.isConnected = true;
    this.networkId = options.networkId;
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
      changeMetamaskChain(EthereumChainParams[this.networkId]);
      return this.metamaskAdapter;
    }
    return this.uniqueAdapter;
  }

  protected getDefaultAdapter(): IMarketContractAdapter {
    return this.uniqueAdapter;
  }
}

export default BaseController;
