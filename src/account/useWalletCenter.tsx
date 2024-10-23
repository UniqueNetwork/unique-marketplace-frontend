import { Signer } from 'ethers';
import { useState, useCallback, useEffect } from 'react';
import { ChainPropertiesResponse } from '@unique-nft/sdk';
import { PolkadotWallet, PolkadotWalletName } from './PolkadotWallet';
import { MetamaskWallet } from './MetamaskWallet';
import { BaseWalletType } from './types';
import { useAccount } from 'wagmi';

export type ConnectedWalletsName = 'polkadot-js' | 'keyring' | 'metamask' | 'talisman' | 'subwallet-js' | 'enkrypt' | 'novawallet' | 'reown';

const wallets = new Map<
  ConnectedWalletsName,
  typeof PolkadotWallet | typeof MetamaskWallet
>([
  ['polkadot-js', PolkadotWallet],
  ['talisman', PolkadotWallet],
  ['subwallet-js', PolkadotWallet],
  ['enkrypt', PolkadotWallet],
  ['novawallet', PolkadotWallet],
  ['metamask', MetamaskWallet]
]);

export const CONNECTED_WALLET_TYPE = 'connected-wallet-type';

export const useWalletCenter = (chainProperties?: ChainPropertiesResponse) => {
  const [connectedWallets, setConnectedWallets] = useState(
    new Map<ConnectedWalletsName, Map<string, BaseWalletType<any>>>([])
  );


  const { address } = useAccount();
  // const { address, isConnected } = useAppKitAccount();
  // const { selectedNetworkId } = useAppKitState();

  const connectWallet = useCallback(
    async (typeWallet: ConnectedWalletsName) => {
      if (!chainProperties) return;
      try {
        const wallet = new (wallets.get(typeWallet)!)(chainProperties, typeWallet as PolkadotWalletName);
        const currentWallets = await wallet.getAccounts();

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

  const connectReownWallet = useCallback(
    async (signer: Signer) => {
      if (!signer) throw new Error('No Reown wallet provider found');
      try {
        const address = await signer.getAddress();

        const newWallets = new Map([
          [
            address,
            {
              name: 'reown',
              normalizedAddress: address,
              address,
              walletMetaInformation: '',
              signerType: 'reown',
              sign: async (message: string) => await signer.signMessage(message),
              signer,
            },
          ],
        ]);

        const savedWallets = localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];

        if (!savedWallets.includes('reown')) {
          savedWallets.push('reown');
          localStorage.setItem(CONNECTED_WALLET_TYPE, savedWallets.join(';'));
        }

        setConnectedWallets((prev) => new Map([...prev, ['reown', newWallets]]));
        return newWallets;
      } catch (e) {
        throw new Error(`Failed to connect Reown wallet: ${e.message}`);
      }
    },
    []
  );

  return {
    connectWallet,
    connectReownWallet,
    connectedWallets,
    // isConnected,
    address,
    // selectedNetworkId,
  } as const;
};
