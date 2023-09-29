import { ChainPropertiesResponse, UnsignedTxPayloadResponse } from '@unique-nft/sdk';
import { u8aToHex } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';
import { KeyringAddress } from '@polkadot/ui-keyring/types';

import { Account, AccountSigner, BaseWalletEntity, BaseWalletType, ConnectedWalletOptions, RequestPasswordCallback } from './types';
import { AccountUtils } from './AccountUtils';

export class KeyringWallet implements BaseWalletEntity<KeyringAddress> {
  private _accounts = new Map<string, BaseWalletType<KeyringAddress>>();
  public passwordCallback?: RequestPasswordCallback;
  isMintingEnabled = true;

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly chainProperties: ChainPropertiesResponse) {}

  getAccounts() {
    const keyringAccounts = keyring.getAccounts();
    this._accounts = new Map(
      keyringAccounts.map((account) => {
        const normalizedAddress = AccountUtils.normalizedAddressAccount(account.address);
        return [
          normalizedAddress,
          {
            name: account.meta.name || '',
            normalizedAddress,
            address: AccountUtils.encodeAddress(
              account.address,
              this.chainProperties.SS58Prefix
            ),
            walletMetaInformation: account,
            signerType: AccountSigner.local,
            sign: this.getSignature,
            signer: {
              address: normalizedAddress,
              sign: async (unsignedTxPayload: UnsignedTxPayloadResponse) => {
                const keyringPair = keyring.getPair(account.address);
                  if (keyringPair.isLocked && this.passwordCallback) {
                    await this.passwordCallback(keyringPair);
                  }

                  const signature = keyringPair.sign(
                    unsignedTxPayload.signerPayloadHex,
                    {
                      withType: true
                    }
                  );

                  return {
                    signature: u8aToHex(signature),
                    signatureType: keyringPair.type
                  };
              }
            },
            changeChain: this.changeChain.bind(this),
            isMintingEnabled: this.isMintingEnabled
          }
        ];
      })
    );

    return Promise.resolve(this._accounts);
  }

  static existExtension() {
    return true;
  }

  changeChain(network: string): Promise<void> {
    return Promise.resolve();
  }

  getSignature = (
    unsignedTxPayload: UnsignedTxPayloadResponse,
    account: Account,
    { password }: { password: string }
  ) => {
    const keyringPair = keyring.getPair(account.address);
    keyringPair.unlock(password);

    if (!keyringPair) {
      throw new Error('Unable to decode using the supplied passphrase');
    }
    const { signerPayloadHex } = unsignedTxPayload;

    const signature = u8aToHex(
      keyringPair.sign(signerPayloadHex, {
        withType: true
      })
    );

    return Promise.resolve(signature);
  };
}
