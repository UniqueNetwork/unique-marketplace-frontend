import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import keyring from '@polkadot/ui-keyring';
import { Address } from '@unique-nft/utils';

import { Account, BaseWalletType, WalletsType } from './types';
import { CONNECTED_WALLET_TYPE, ConnectedWalletsName, useWalletCenter } from './useWalletCenter';

import { DefaultAccountKey } from './constants';
import { SignModal } from '../components/SignModal/SignModal';
import { AccountProvider } from './AccountContext';
import { useApi } from 'hooks/useApi';
import { useBalanceSubscriptions } from './useBalanceSubscriptions';
import { KeyringPair } from '@polkadot/keyring/types';

export const AccountWrapper: FC = ({ children }) => {
  const { chainProperties, api } = useApi();
  const [accounts, setAccounts] = useState<Map<string, BaseWalletType<WalletsType>>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const [signer, setSigner] = useState<KeyringPair>();

  const walletsCenter = useWalletCenter(chainProperties);
  const { subscribeBalancesChanges, isBalancesFetching } = useBalanceSubscriptions();

  useEffect(() => {
    setAccounts((accounts) => {
      return Array.from(accounts.values()).reduce((acc, account) => {
        if (Address.is.ethereumAddressInAnyForm(account.address)) {
          acc.set(account.address, account);
          return acc;
        }
        const address = Address.normalize.substrateAddress(
          account.address,
          chainProperties?.SS58Prefix
        );
        acc.set(address, { ...account, address });
        return acc;
      }, new Map<string, BaseWalletType<WalletsType>>());
    });

    setSelectedAccount((account) => {
      if (!account || Address.is.ethereumAddressInAnyForm(account.address)) {
        return account;
      }
      const address = Address.normalize.substrateAddress(
        account.address,
        chainProperties?.SS58Prefix
      );
      return { ...account, address };
    });
  }, [chainProperties]);

  const changeAccount = useCallback(
    (account: Account) => {
      if (selectedAccount?.address === account.address) {
        return;
      }
      localStorage.setItem(DefaultAccountKey, account.normalizedAddress);

      setSelectedAccount(account);
    },
    [selectedAccount?.address]
  );

  const [isSignModalVisible, setIsSignModalVisible] = useState<boolean>(false);

  const onSignCallback = useRef<(password?: string) => void | undefined>();

  const showSignDialog = useCallback((pair: KeyringPair) => {
    setSigner(pair);
    setIsSignModalVisible(true);

    return new Promise<string>((resolve, reject) => {
      onSignCallback.current = (password?: string) => {
        if (password) {
          resolve(password);
        } else {
          reject(new Error('Signing failed'));
        }
      };
    });
  }, []);

  const onClose = useCallback(() => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(undefined);
  }, []);

  const onSignFinish = useCallback((password: string) => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(password);
  }, []);

  const forgetLocalAccount = useCallback(
    async (forgetAddress: string) => {
      keyring.forgetAccount(forgetAddress);
      setIsLoading(true);
      await walletsCenter.connectWallet(
        'keyring',
        {
          requestPasswordCallback: showSignDialog
        }
      );
      setIsLoading(false);
    },
    [walletsCenter]
  );

  useEffect(() => {
    if (!accounts?.size || isLoading) {
      return;
    }

    const defaultAccountNormalizedAddress = localStorage.getItem(DefaultAccountKey) || '';

    const defaultAccountAddress = Address.is.ethereumAddressInAnyForm(defaultAccountNormalizedAddress)
      ? defaultAccountNormalizedAddress
      : Address.normalize.substrateAddress(defaultAccountNormalizedAddress, chainProperties?.SS58Prefix);

    const defaultAccount = accounts.get(defaultAccountAddress);

    const [firstAccount] = accounts.keys();
    const account = accounts.get(firstAccount);
    const selectedAccount = defaultAccount || account;
    if (selectedAccount) {
      changeAccount(selectedAccount);
    }
  }, [accounts, changeAccount, isLoading]);

  useEffect(() => {
    if (!chainProperties || !api?.market?.uniqueSdk) return;
    const getConnectedWallets = localStorage.getItem(CONNECTED_WALLET_TYPE);
    if (!getConnectedWallets) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const wallets = getConnectedWallets.split(';') as ConnectedWalletsName[];
    const connectedWallets = wallets.map((typeWallet) =>
      walletsCenter.connectWallet(
        typeWallet,
        {
          requestPasswordCallback: showSignDialog
        }
      )
    );
    if (!connectedWallets.length) {
      setIsLoading(false);
      return;
    }

    void Promise.allSettled(connectedWallets)
      .then((results) => {
        const map = new Map();
        results.forEach((result) => {
          if (result.status !== 'fulfilled' || !result.value) return;
          result.value.forEach((acc, address) => {
            map.set(address, acc);
          });
        });

        void (async () => {
          setAccounts(await subscribeBalancesChanges(map, setAccounts));
          setIsLoading(false);
        })();
      });
  }, [chainProperties, api?.market?.uniqueSdk]);

  const value = useMemo(
    () => ({
      isLoading: isLoading || isBalancesFetching,
      signer,
      accounts,
      selectedAccount,
      forgetLocalAccount,
      fetchAccountsError,
      changeAccount,
      setFetchAccountsError,
      setIsLoading,
      showSignDialog,
      walletsCenter
    }),
    [
      isLoading,
      isBalancesFetching,
      signer,
      accounts,
      selectedAccount,
      forgetLocalAccount,
      fetchAccountsError,
      changeAccount,
      showSignDialog,
      walletsCenter
    ]
  );

  return (
    <AccountProvider value={value}>
      {children}
      <SignModal
        isVisible={isSignModalVisible}
        onClose={onClose}
        onFinish={onSignFinish}
      />
    </AccountProvider>
  );
};
