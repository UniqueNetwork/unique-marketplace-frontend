import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AccountProvider, MarketAccount as Account } from './AccountContext';
import { SignModal } from 'components/SignModal/SignModal';
import { KeyringPair } from '@polkadot/keyring/types';
import { BN } from '@polkadot/util';
import { Codec } from '@polkadot/types/types';
import { useApi } from 'hooks/useApi';
import { getWithdrawBids } from 'api/restApi/auction/auction';
import { Accounts, ProviderClass, UnsignedTxPayload } from '@unique-nft/accounts';

import { PolkadotProvider, PolkadotAccount } from '@unique-nft/accounts/polkadot';
import { KeyringLocalProvider, KeyringLocalAccount } from '@unique-nft/accounts/keyring-local';
import { MetamaskProvider, MetamaskAccount } from '@unique-nft/accounts/metamask';

export const DefaultAccountKey = 'unique_market_account_address';

const AccountWrapper: FC<{ _accounts?: Accounts }> = ({ _accounts = new Accounts(), children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState<boolean>(false);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const { api, kusamaSdk, baseURL } = useApi();

  const unsubscribesBalancesChanges = useRef<Record<string, Codec>>({
    // TODO: !!!!!!!!!
  });
  const subscribeBalancesChanges = useCallback(async (accounts: Account[]) => {
    // TODO: get balance via new rest subscribtions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }, [kusamaSdk, setAccounts]);

  const changeAccount = useCallback((account: Account) => {
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(account);
  }, []);

  const [isSignModalVisible, setIsSignModalVisible] = useState<boolean>(false);
  const [localSignerKeyringPair, setLocalSignerKeyringPair] = useState<KeyringPair>();
  const onSignCallback = useRef<(password?: string) => void>();
  const showSignDialog = useCallback((KeyringPair: KeyringPair) => {
    setLocalSignerKeyringPair(KeyringPair);
    setIsSignModalVisible(true);
    return new Promise<string>((resolve, reject) => {
      onSignCallback.current = (password) => {
        if (password) {
          resolve(password);
        } else reject(new Error('Signing failed'));
      };
    });
  }, []);

  const fetchAccounts = useCallback(async () => {
    if (!api?.market) return;
    // await _accounts.addProvider<ProviderClass<any>>(KeyringLocalProvider, { passwordCallback: showSignDialog });
    // await _accounts.addProvider<ProviderClass<any>>(PolkadotProvider);
    // await _accounts.addProvider<ProviderClass<any>>(MetamaskProvider);

    const allAccounts = (await _accounts?.getAccounts())?.map((account) => {
      let name; // TODO: refactor?
      const marketAccount = { account: account as unknown } as Account;
      switch (account.constructor) {
        case PolkadotAccount:
          // TODO: if account is from polka but has ethereum address - either ignore it or figure out how to deal with it
          name = (account as PolkadotAccount).injectedAccount.meta.name || `Polkadotjs: ${account.address}`;
          // In metamask we provide "signer" object. For polkadotjs we provide keyringpair.account. Both should be provided as OurCustomAccount.signer depending on provider
          marketAccount.signer = account;
        break;
        case KeyringLocalAccount:
          name = (account as unknown as KeyringLocalAccount).keyringPair.meta.name as string || `Unknown local account: ${account.address}`;
          marketAccount.signer = account;
        break;
        case MetamaskAccount:
          name = 'Metamask Account';
          // TODO: signer is prive inside metamask account for some reason. We may consider taking it from ethers directly instead...
          // @ts-ignore
          marketAccount.signer = account.signer;
        break;
        default:
          console.error('Corrupted account: ', account);
          throw new Error('Unknown account type faced');
      }
      marketAccount.name = name;
      marketAccount.address = account.address;
      marketAccount.isLocal = account instanceof KeyringLocalAccount;
      return marketAccount;
    }) || [];

    const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
    const defaultAccount = allAccounts.find((item) => item.address === defaultAccountAddress) || allAccounts[0];

    const balance = await api.market.getAccountBalance(defaultAccount.address);
    defaultAccount.balance = { raw: new BN(balance?.freeBalance?.raw || 0), parsed: balance?.freeBalance?.amount || '0' };

    changeAccount(defaultAccount);

    setAccounts(allAccounts);

    setIsLoading(false);

    // await subscribeBalancesChanges(allAccounts);
  }, [api?.market, changeAccount]);

  useEffect(() => {
    if (!api?.market) return;
    setIsLoading(true);
    void (async () => {
      await _accounts.addProvider<ProviderClass<any>>(KeyringLocalProvider, { passwordCallback: showSignDialog });
      await _accounts.addProvider<ProviderClass<any>>(PolkadotProvider);
      await _accounts.addProvider<ProviderClass<any>>(MetamaskProvider);
      await fetchAccounts();
    })();
  }, [api?.market, subscribeBalancesChanges, fetchAccounts, showSignDialog]);

  const onClose = useCallback(() => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(undefined);
  }, []);

  const onSignFinish = useCallback((password: string | undefined) => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(password);
  }, []);

  const getAccountDeposit = useCallback(async (account: Account) => {
    return {
      bids: (await getWithdrawBids(baseURL, { owner: account.address })).data || { withdraw: [], leader: [] }
    };
  }, [baseURL]);

  const updateAccountsDeposits = useCallback(async () => {
    if (!api?.market) return;
    setIsLoadingDeposits(true);

    setAccounts(await Promise.all(accounts.map(async (account) => {
      // account.deposits = await getAccountDeposit(account);
      // Will be used when we bring back auctions
      await Promise.resolve();
      return account;
    })));

    setIsLoadingDeposits(false);
  }, [accounts.length, api?.market, getAccountDeposit]);

  const updateCurrentAccountDeposit = useCallback(async () => {
    if (!selectedAccount) return Promise.resolve();
    const balance = await api?.market?.getAccountBalance(selectedAccount.address);
    // const deposits = await getAccountDeposit(selectedAccount);
    setAccounts((accounts) => accounts.map((account) => {
      if (account.address === selectedAccount.address) {
        // account.deposits = deposits;
        account.balance = { raw: new BN(balance?.freeBalance?.raw || 0), parsed: balance?.freeBalance?.amount || '0' };
      }
      return account;
    }));
  }, [api?.market, selectedAccount]);

  useEffect(() => {
    void updateCurrentAccountDeposit();
  }, [updateCurrentAccountDeposit]);

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
    updateAccountsDeposits,
    updateCurrentAccountDeposit
  }), [isLoading, isLoadingDeposits, accounts, fetchAccounts, updateAccountsDeposits, selectedAccount, fetchAccountsError, changeAccount, showSignDialog, updateCurrentAccountDeposit]);

  return (
    <AccountProvider value={value}>
      {children}
      <SignModal
        keyringPair={localSignerKeyringPair}
        isVisible={isSignModalVisible}
        onClose={onClose}
        onFinish={onSignFinish}
      />
    </AccountProvider>
  );
};

export default AccountWrapper;
