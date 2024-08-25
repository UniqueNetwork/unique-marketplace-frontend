import { FCC, useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from '@unique-nft/utils';

import { Account, BaseWalletType, WalletsType } from './types';
import { CONNECTED_WALLET_TYPE, ConnectedWalletsName, useWalletCenter } from './useWalletCenter';

import { DefaultAccountKey } from './constants';
import { AccountProvider } from './AccountContext';
import { useApi } from 'hooks/useApi';
import { useBalanceSubscriptions } from './useBalanceSubscriptions';

export const AccountWrapper: FCC = ({ children }) => {
  const { chainProperties, api } = useApi();
  const [accounts, setAccounts] = useState<Map<string, BaseWalletType<WalletsType>>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();

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

  useEffect(() => {
    if (!accounts?.size || isLoading) {
      return;
    }

    const defaultAccountNormalizedAddress = localStorage.getItem(DefaultAccountKey) || '';

    const defaultAccountAddress = defaultAccountNormalizedAddress
      ? Address.is.ethereumAddressInAnyForm(defaultAccountNormalizedAddress)
        ? defaultAccountNormalizedAddress
        : Address.normalize.substrateAddress(defaultAccountNormalizedAddress, chainProperties?.SS58Prefix)
          : '';

    const defaultAccount = accounts.get(defaultAccountAddress);

    const [firstAccount] = accounts.keys();
    const account = accounts.get(firstAccount);
    const selectedAccount = defaultAccount || account;
    if (selectedAccount) {
      changeAccount(selectedAccount);
    }
  }, [accounts, changeAccount, isLoading]);

  const fetchAccounts = useCallback(() => {
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
        typeWallet
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

  useEffect(fetchAccounts, [fetchAccounts]);

  const value = useMemo(
    () => ({
      isLoading: isLoading || isBalancesFetching,
      accounts,
      selectedAccount,
      fetchAccountsError,
      changeAccount,
      setFetchAccountsError,
      setIsLoading,
      walletsCenter,
      fetchAccounts
    }),
    [
      isLoading,
      isBalancesFetching,
      accounts,
      selectedAccount,
      fetchAccountsError,
      changeAccount,
      walletsCenter,
      fetchAccounts
    ]
  );

  return (
    <AccountProvider value={value}>
      {children}
    </AccountProvider>
  );
};
