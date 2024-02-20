import { useCallback, useState } from 'react';
import { ChainPropertiesResponse } from '@unique-nft/sdk';

import { PolkadotWallet, PolkadotWalletName } from './PolkadotWallet';
import { KeyringWallet } from './KeyringWallet';
import { MetamaskWallet } from './MetamaskWallet';
import { BaseWalletType, ConnectedWalletOptions } from './types';

export type ConnectedWalletsName = 'polkadot-js' | 'keyring' | 'metamask' | 'talisman' | 'subwallet-js' | 'enkrypt' | 'novawallet';

const wallets = new Map<
  ConnectedWalletsName,
  typeof PolkadotWallet | typeof KeyringWallet | typeof MetamaskWallet
>([
  ['polkadot-js', PolkadotWallet],
  ['talisman', PolkadotWallet],
  ['subwallet-js', PolkadotWallet],
  ['enkrypt', PolkadotWallet],
  ['novawallet', PolkadotWallet],
  ['keyring', KeyringWallet],
  ['metamask', MetamaskWallet]
]);

export const CONNECTED_WALLET_TYPE = 'connected-wallet-type';

export const useWalletCenter = (chainProperties?: ChainPropertiesResponse) => {
  const [connectedWallets, setConnectedWallets] = useState(
    new Map<ConnectedWalletsName, Map<string, BaseWalletType<any>>>([])
  );

  const connectWallet = useCallback(
    async (typeWallet: ConnectedWalletsName, options?: ConnectedWalletOptions) => {
      if (!chainProperties) return;
      try {
        const wallet = new (wallets.get(typeWallet)!)(chainProperties, typeWallet as PolkadotWalletName);
        const currentWallets = await wallet.getAccounts();

        if (typeWallet === 'keyring' && options?.requestPasswordCallback) {
          (wallet as KeyringWallet).passwordCallback = options.requestPasswordCallback;
        }

        const connectedWallets =
          localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];

        if (!connectedWallets.includes(typeWallet)) {
          connectedWallets.push(typeWallet);
          localStorage.setItem(CONNECTED_WALLET_TYPE, connectedWallets.join(';'));
        }

        setConnectedWallets((prev) => new Map([...prev, [typeWallet, currentWallets]]));
        return currentWallets;
      } catch (e: any) {
        const connectedWallets =
          localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];
        if (connectedWallets.includes(typeWallet)) {
          localStorage.setItem(
            CONNECTED_WALLET_TYPE,
            connectedWallets.filter((type) => type !== typeWallet).join(';')
          );
        }
        throw e;
      }
    },
    [chainProperties]
  );

  return {
    connectWallet,
    connectedWallets
  } as const;
};
