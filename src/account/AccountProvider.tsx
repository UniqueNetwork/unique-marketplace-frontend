import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Account, AccountProvider, AccountSigner } from './AccountContext';
import { SignModal } from '../components/SignModal/SignModal';
import { KeyringPair } from '@polkadot/keyring/types';
import { web3Accounts, web3Enable, web3AccountsSubscribe } from '@polkadot/extension-dapp';
import { sleep } from '../utils/helpers';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';
import { Codec } from '@polkadot/types/types';
import { useApi } from '../hooks/useApi';
import { getWithdrawBids } from '../api/restApi/auction/auction';

export const DefaultAccountKey = 'unique_market_account_address';

type TQueryAccountResponse = { data: { free: BN } };

const AccountWrapper: FC = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState<boolean>(false);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const { api, kusamaSdk } = useApi();

  const changeAccount = useCallback((account: Account) => {
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(account);
  }, []);

  const [isSignModalVisible, setIsSignModalVisible] = useState<boolean>(false);
  const [signerAccount, setSignerAccount] = useState<Account>();
  const onSignCallback = useRef<(signature?: KeyringPair) => void | undefined>();
  const showSignDialog = useCallback((account: Account) => {
    setSignerAccount(account);
    setIsSignModalVisible(true);
    return new Promise<KeyringPair>((resolve, reject) => {
      onSignCallback.current = (signature?: KeyringPair) => {
        if (signature) resolve(signature);
        else reject(new Error('Signing failed'));
      };
    });
  }, []);

  const onClose = useCallback(() => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(undefined);
  }, []);

  const onSignFinish = useCallback((signature: KeyringPair) => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(signature);
  }, []);

  const getExtensionAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    let extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      console.log('Extension not found, retry in 1s');
      await sleep(1000);
      extensions = await web3Enable('my cool dapp');
      if (extensions.length === 0) {
        return [];
      }
    }

    return (await web3Accounts()).map((account) => ({ ...account, signerType: AccountSigner.extension })) as Account[];
  }, []);

  const getLocalAccounts = useCallback(() => {
    const keyringAccounts = keyring.getAccounts();
    return keyringAccounts.map((account) => ({ address: account.address, meta: account.meta, signerType: AccountSigner.local } as Account));
  }, []);

  const getAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    const extensionAccounts = await getExtensionAccounts();
    const localAccounts = getLocalAccounts();

    const allAccounts: Account[] = [...extensionAccounts, ...localAccounts];

    return allAccounts;
  }, [getExtensionAccounts, getLocalAccounts]);

  const getAccountBalance = useCallback(async (account: Account) => {
    // const balances = await rpcClient?.rawKusamaRpcApi?.derive.balances?.all(account.address);
    const balances = await api?.market?.getAccountBalance(account.address);
    return new BN(balances?.freeBalance?.raw || 0);
  }, [api]);

  const getAccountsBalances = useCallback(async (accounts: Account[]) => Promise.all(accounts.map(async (account: Account) => ({
    ...account,
    balance: {
      KSM: await getAccountBalance(account) // TODO: it's possible to subscribe on balances via rpc
    }
  } as Account))), [getAccountBalance]);

  const getAccountsWhiteListStatus = useCallback((accounts: Account[]) => {
    if (!api?.market) return accounts;
    return Promise.all(accounts.map(async (account: Account) => ({
      ...account,
      isOnWhiteList: await api?.market?.checkWhiteListed(account.address)
    })));
  }, [api?.market]);

  const unsubscribesBalancesChanges = useRef<Record<string, Codec>>({});
  const subscribeBalancesChanges = useCallback(async (accounts: Account[]) => {
    if (!kusamaSdk?.api) return;

    const unsubscribes = await Promise.all(accounts.map(async (account) => {
      const unsubscribe = await kusamaSdk.api.query.system.account(account.address, ({ data: { free } }: TQueryAccountResponse) => {
        if (!account.balance?.KSM || !free.sub(account.balance.KSM).isZero()) {
          setAccounts((accounts) => accounts.map((_account: Account) => ({
            ..._account,
            balance: account.address === _account.address ? { KSM: free } : _account.balance
          })));
        }
      });
      return { [account.address]: unsubscribe };
    }));

    unsubscribesBalancesChanges.current = unsubscribes.reduce<Record<string, Codec>>((acc, item) => ({ ...acc, ...item }), {});
  }, [kusamaSdk, setAccounts]);

  const fetchAccounts = useCallback(async () => {
    // if (!rpcClient?.isKusamaApiConnected) return;
    if (!kusamaSdk) return;
    setIsLoading(true);

    const allAccounts = await getAccounts();

    if (allAccounts?.length) {
      const accountsWithBalance = await getAccountsBalances(allAccounts);
      const accountsWithWhiteListStatus = await getAccountsWhiteListStatus(accountsWithBalance);

      setAccounts(accountsWithWhiteListStatus);

      await subscribeBalancesChanges(accountsWithWhiteListStatus);

      const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
      const defaultAccount = allAccounts.find((item) => item.address === defaultAccountAddress);

      if (defaultAccount) {
        changeAccount(defaultAccount);
      } else {
        changeAccount(allAccounts[0]);
      }
    } else {
      setFetchAccountsError('No accounts in extension');
    }
    setIsLoading(false);
  }, [kusamaSdk, getAccountsBalances, getAccountsWhiteListStatus]);

  const fetchAccountsWithDeposits = useCallback(async () => {
    setIsLoadingDeposits(true);
    const _accounts = await Promise.all(accounts.map(async (account) => ({
      ...account,
      deposits: {
        bids: (await getWithdrawBids({ owner: account.address })).data || { withdraw: [], leader: [] },
        sponsorshipFee: await api?.market?.getUserDeposit(account.address)
      }
    })));
    setAccounts(_accounts);
    setIsLoadingDeposits(false);
    return _accounts;
  }, [accounts]);

  const value = useMemo(() => ({
    isLoading,
    isLoadingDeposits,
    accounts,
    selectedAccount,
    fetchAccountsError,
    changeAccount,
    setSelectedAccount,
    showSignDialog,
    fetchAccounts,
    fetchAccountsWithDeposits
  }), [isLoading, isLoadingDeposits, accounts, fetchAccounts, fetchAccountsWithDeposits, selectedAccount, fetchAccountsError, changeAccount]);

  return (
    <AccountProvider value={value}>
      {children}
      <SignModal
        account={signerAccount}
        isVisible={isSignModalVisible}
        onClose={onClose}
        onFinish={onSignFinish}
      />
    </AccountProvider>
  );
};

export default AccountWrapper;
