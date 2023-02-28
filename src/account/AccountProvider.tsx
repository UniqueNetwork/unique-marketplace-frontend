import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AccountProvider } from './AccountContext';
import { SignModal } from 'components/SignModal/SignModal';
import { KeyringPair } from '@polkadot/keyring/types';
import { BN } from '@polkadot/util';
import { Codec } from '@polkadot/types/types';
import { useApi } from 'hooks/useApi';
import { getWithdrawBids } from 'api/restApi/auction/auction';
import { Accounts, ProviderClass } from '@unique-nft/accounts';

import { PolkadotProvider, PolkadotAccount } from '@unique-nft/accounts/polkadot';
import { KeyringLocalProvider, KeyringLocalAccount } from '@unique-nft/accounts/keyring-local';
import { Account } from '@unique-nft/accounts/types';
import { isEthereumAddress } from '@polkadot/util-crypto';

export const DefaultAccountKey = 'unique_market_account_address';

type TQueryAccountResponse = { data: { free: BN } };

const AccountWrapper: FC<{ _accounts?: Accounts }> = ({ _accounts = new Accounts(), children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState<boolean>(false);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const { api, kusamaSdk, baseURL } = useApi();

  const unsubscribesBalancesChanges = useRef<Record<string, Codec>>({});
  const subscribeBalancesChanges = useCallback(async (accounts: Account[]) => {
    // if (!kusamaSdk?.api) return;
    //
    // const unsubscribes = await Promise.all(accounts.map(async (account) => {
    //   const unsubscribe = await kusamaSdk.api.query.system.account(account.getAddress(), ({ data: { free } }: TQueryAccountResponse) => {
    //     if (!account.balance?.KSM || !free.sub(account.balance.KSM).isZero()) {
    //       setAccounts((accounts) => accounts.map<Account>((_account) => {
    //         _account.balance = account.getAddress() === _account.getAddress() ? { KSM: free } : _account.balance;
    //         return _account;
    //       }));
    //     }
    //   });
    //   return { [account.getAddress()]: unsubscribe };
    // }));
    //
    // unsubscribesBalancesChanges.current = unsubscribes.reduce<Record<string, Codec>>((acc, item) => ({ ...acc, ...item }), {});
  }, [kusamaSdk, setAccounts]);

  const getAccountsWhiteListStatus = useCallback((accounts: Account[]) => {
    if (!api?.market) return accounts;
    return Promise.all(accounts.map(async (account: Account) => {
      account.isOnWhiteList = await api?.market?.checkWhiteListed(account.getAddress());
      return account;
    }));
  }, [api?.market]);

  useEffect(() => {
    if (!api?.market) return;
    setIsLoading(true);
    void (async () => {
      await _accounts.addProvider<ProviderClass<any>>(KeyringLocalProvider, { passwordCallback: showSignDialog });
      await _accounts.addProvider<ProviderClass<any>>(PolkadotProvider);

      const allAccounts = (await _accounts?.getAccounts())?.map((account) => {
        account.name = (account instanceof PolkadotAccount
          ? (account).injectedAccount
          : (account as unknown as KeyringLocalAccount).keyringPair).meta.name as string;
        account.address = account.getAddress();
        account.isLocal = account instanceof KeyringLocalAccount;
        return account;
      }) || [];

      const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
      const defaultAccount = allAccounts.find((item) => item.address === defaultAccountAddress) || allAccounts[0];

      defaultAccount.balance = { KSM: new BN((await api.market!.getAccountBalance(defaultAccount.getAddress()))?.freeBalance?.raw || 0) };

      changeAccount(defaultAccount);

      setAccounts(await getAccountsWhiteListStatus(allAccounts));

      setIsLoading(false);

      // await subscribeBalancesChanges(allAccounts);
    })();
  }, [api?.market, subscribeBalancesChanges, getAccountsWhiteListStatus]);

  const changeAccount = useCallback((account: Account) => {
    localStorage.setItem(DefaultAccountKey, account.getAddress());
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

  const onClose = useCallback(() => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(undefined);
  }, []);

  const onSignFinish = useCallback((password: string | undefined) => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(password);
  }, []);

  const getAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    const extensionAccounts = await getExtensionAccounts();
    const localAccounts = getLocalAccounts();

    const allAccounts: Account[] = [...extensionAccounts, ...localAccounts];

    return allAccounts.filter((account) => !isEthereumAddress(account.address));
  }, [getExtensionAccounts, getLocalAccounts]);

  const getAccountBalance = useCallback(async (account: Account) => {
    // const balances = await rpcClient?.rawKusamaRpcApi?.derive.balances?.all(account.address);
    const balances = await api?.market?.getAccountBalance(account.address);
    return new BN(balances?.freeBalance?.raw || 0);
  }, [api?.market]);

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

  const getAccountDeposit = useCallback(async (account: Account) => {
    return {
      bids: (await getWithdrawBids(baseURL, { owner: account.getAddress() })).data || { withdraw: [], leader: [] },
      sponsorshipFee: await api?.market?.getUserDeposit(account.getAddress())
    };
  }, [baseURL, api?.market]);

  const updateAccountsDeposits = useCallback(async () => {
    if (!api?.market) return;
    setIsLoadingDeposits(true);

    setAccounts(await Promise.all(accounts.map(async (account) => {
      account.deposits = await getAccountDeposit(account);
      return account;
    })));

    setIsLoadingDeposits(false);
  }, [accounts.length, api?.market, getAccountDeposit]);

  const fetchAccounts = useCallback(async () => {
    if (!api?.market) return Promise.resolve();
    const allAccounts = (await _accounts?.getAccounts())?.map((account) => {
      account.name = (account instanceof PolkadotAccount
        ? (account).injectedAccount
        : (account as unknown as KeyringLocalAccount).keyringPair).meta.name as string;
      account.address = account.getAddress();
      account.isLocal = account instanceof KeyringLocalAccount;
      return account;
    }) || [];

    setAccounts(await getAccountsWhiteListStatus(allAccounts));

    await subscribeBalancesChanges(allAccounts);
  }, [api?.market, getAccountsWhiteListStatus, getAccountDeposit]);

  const updateCurrentAccountDeposit = useCallback(async () => {
    if (!selectedAccount) return Promise.resolve();
    const balance = await api?.market?.getAccountBalance(selectedAccount.getAddress());
    const deposits = await getAccountDeposit(selectedAccount);
    setAccounts((accounts) => accounts.map((account) => {
      if (account.address === selectedAccount.address) {
        account.deposits = deposits;
        account.balance = { KSM: new BN(balance?.freeBalance?.raw || 0) };
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
  }), [isLoading, isLoadingDeposits, accounts, fetchAccounts, updateAccountsDeposits, selectedAccount, fetchAccountsError, changeAccount]);

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
