import { ChainPropertiesResponse, UnsignedTxPayloadResponse } from '@unique-nft/sdk';
import { web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Polkadot, SignerPayloadJSON } from '@unique-nft/utils/extension';
import { Address } from '@unique-nft/utils';

import { Account, AccountSigner, BaseWalletEntity, BaseWalletType } from './types';

export type PolkadotWalletName = 'polkadot-js' | 'subwallet-js' | 'talisman' | 'enkrypt' | 'novawallet';

export class PolkadotWallet implements BaseWalletEntity<InjectedAccountWithMeta> {
  _accounts = new Map<string, BaseWalletType<InjectedAccountWithMeta>>();
  isMintingEnabled = true;
  wallet: PolkadotWalletName;

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly chainProperties: ChainPropertiesResponse, defaultWallet: PolkadotWalletName = 'polkadot-js') {
    this.wallet = defaultWallet;
  }

  changeChain(): Promise<void> {
    return Promise.resolve();
  }

  async getAccounts() {
    let wallets;
    try {
      await web3Enable('Unique Marketplace');

      wallets = await Polkadot.loadWalletByName(this.wallet);

      if (!wallets) {
        throw new Error(`${this.wallet} extension is not installed or disabled. Please install it or activate in your browser settings.`);
      }

      if (!wallets.accounts) {
        throw new Error(`${this.wallet} extension is not installed or disabled. Please install it or activate in your browser settings.`);
      }
    } catch (error: any) {
      console.error(`Failed to load ${this.wallet} wallet:`, error);
      
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('extension is not installed') || 
          errorMessage.includes('not available') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('No extension')) {
        throw error;
      }
      
      throw new Error(`${this.wallet} extension is not installed or disabled. Please install it or activate in your browser settings.`);
    }

    this._accounts = new Map(
      wallets.accounts
        .filter(({ address }) => Address.is.substrateAddress(address))
        .map((account) => {
        const normalizedAddress = Address.normalize.substrateAddress(account.address);
        const address = Address.normalize.substrateAddress(
          account.address,
          this.chainProperties.SS58Prefix
        );
        return [
          normalizedAddress,
          {
            name: account.meta.name || '',
            normalizedAddress,
            address,
            walletMetaInformation: account,
            signerType: AccountSigner.extension,
            sign: account.signer.sign,
            signer: { ...account.signer, address },
            changeChain: this.changeChain.bind(this),
            isMintingEnabled: this.isMintingEnabled
          }
        ];
      })
    );

    return this._accounts;
  }

  getSignature = async (
    unsignedTxPayload: UnsignedTxPayloadResponse,
    account: Account<InjectedAccountWithMeta>
  ) => {
    const injector = await web3FromSource(account.walletMetaInformation.meta.source);
    if (!injector.signer.signPayload) {
      throw new Error('Web3 not available');
    }

    const result = await injector.signer.signPayload(
      {
        ...unsignedTxPayload?.signerPayloadJSON as SignerPayloadJSON,
        transactionVersion: unsignedTxPayload.signerPayloadJSON.transactionVersion as `0x${string}`,
        tip: unsignedTxPayload.signerPayloadJSON.tip as `0x${string}`,
        specVersion: unsignedTxPayload.signerPayloadJSON.specVersion as `0x${string}`,
        nonce: unsignedTxPayload.signerPayloadJSON.nonce as `0x${string}`,
        era: unsignedTxPayload.signerPayloadJSON.era as `0x${string}`,
        genesisHash: unsignedTxPayload.signerPayloadJSON.genesisHash as `0x${string}`,
        blockNumber: unsignedTxPayload.signerPayloadJSON.blockNumber as `0x${string}`,
        blockHash: unsignedTxPayload.signerPayloadJSON.blockHash as `0x${string}`
      }
    );

    return result.signature;
  };
}
