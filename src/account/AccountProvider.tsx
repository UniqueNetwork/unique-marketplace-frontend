import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AccountProvider } from './AccountContext';
import { SignModal } from 'components/SignModal/SignModal';
import { KeyringPair } from '@polkadot/keyring/types';
import { BN } from '@polkadot/util';
import { useApi } from 'hooks/useApi';
import { getWithdrawBids } from 'api/restApi/auction/auction';
import { Accounts, ProviderClass } from '@unique-nft/accounts';

import { SocketClient, SubscriptionEvents } from '@unique-nft/sdk/full';
import { PolkadotProvider, PolkadotAccount } from '@unique-nft/accounts/polkadot';
import { KeyringLocalAccount } from '@unique-nft/accounts/keyring-local';
import { MetamaskProvider, MetamaskAccount } from '@unique-nft/accounts/metamask';
import { ConnectAccounts } from 'components/ConnectAccounts';
import { MarketAccount, ProviderTypesName } from './types';
import keyring from '@polkadot/ui-keyring';
import { KeyringLocalProvider } from './providers/KeyringProvider';
import { Signer } from 'ethers';

export const DefaultAccountKey = 'unique_market_account_address';
export const ConnectedAccountTypesKey = 'unique_market_account_types';

const ProviderTypes: Record<ProviderTypesName, typeof PolkadotProvider | typeof KeyringLocalProvider | typeof MetamaskProvider> = {
  polkadot: PolkadotProvider,
  keyring: KeyringLocalProvider,
  metamask: MetamaskProvider
};

const EthereumChainIds: Record<string, string> = {
  unique: '0x22b0',
  quartz: '0x22b1',
  opal: '0x22b2',
  sapphire: '0x22b3'
};

const AccountWrapper: FC<{ _accounts?: Accounts }> = ({ _accounts = new Accounts(), children }) => {
  const [accounts, setAccounts] = useState<MarketAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState<boolean>(false);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<MarketAccount>();
  const [isOpenConnectWalletModal, setIsOpenConnectWalletModal] = useState<boolean>(false);
  const { api, baseURL, currentChainId } = useApi();

  const sdkSocketClient = useRef<SocketClient>();
  const subscribeBalancesChanges = useCallback((accountsWithBalances: MarketAccount[]) => {
    const sdk = api?.market?.uniqueSdk;
    if (!sdk) return;
      // always recreate client just in case (ex. network changed) whenever accounts refetched
    const client: SocketClient = sdk.subscription.connect({
      transports: ['websocket']
    });
    if (sdkSocketClient.current) {
      sdkSocketClient.current.socket.removeAllListeners();
    }
    accountsWithBalances.forEach((account) => {
      client.subscribeAccountCurrentBalance({ address: account.address });
    });
    client.on(SubscriptionEvents.ACCOUNT_CURRENT_BALANCE, (room, data) => {
      try {
        const address = data.balance.address;
        const newBalance = data.balance.availableBalance;
        const accountIndex = accountsWithBalances.findIndex((acc) => acc.address.toLowerCase() === address.toLowerCase());
        const accountsCopy = [...accountsWithBalances];
        const targetAccount = accountsCopy[accountIndex];
        if (!targetAccount) {
          console.error('Account for data: ', data, ' not found in list of accounts');
          throw new Error('Event fired for non-existing account');
        }
        targetAccount.balance = {
          withdraw: targetAccount.balance.withdraw,
          parsed: newBalance.amount,
          raw: new BN(newBalance.raw)
        };
        setAccounts(accountsCopy);
      } catch (e) {
        console.error('Falied to get balance update: ', e);
      }
    });
    sdkSocketClient.current = client;
  }, [api, accounts]);

  const changeAccount = useCallback(async (account: MarketAccount) => {
    if (!api?.market || !account?.address) return;
    const balance = await api.market.getAccountBalance(account.address);
    const accountWithBalance = { ...account, balance };
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(accountWithBalance);
  }, [api?.market]);

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
    setIsLoading(true);

    const allAccounts = (await _accounts?.getAccounts())?.map((account) => {
      let name; // TODO: refactor?
      const marketAccount = { account: account as unknown } as MarketAccount;
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

    const accountsWithBalances = await Promise.all(allAccounts.map(async (account) => {
      const balance = await api.market!.getAccountBalance(account.address);
      return { ...account, balance };
    }));

    const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
    const defaultAccount = accountsWithBalances.find((item) => item.address === defaultAccountAddress) || allAccounts[0];

    await changeAccount(defaultAccount);

    setAccounts(accountsWithBalances);

    setIsLoading(false);

    subscribeBalancesChanges(accountsWithBalances);
  }, [api?.market, changeAccount]);

  useEffect(() => {
    if (!api?.market) return;
    setIsLoading(true);
    void (async () => {
      if (!currentChainId) return;
      const connectedProviders = (localStorage.getItem(ConnectedAccountTypesKey)?.split(';') || ['keyring']) as ProviderTypesName[];
      await Promise.all(connectedProviders.map(async (type) => {
        if (!type) return;

        const provider = await _accounts.addProvider<ProviderClass<any>>(
          ProviderTypes[type],
          type === 'keyring' ? { passwordCallback: showSignDialog } : undefined
        );
        if (type === 'metamask') {
          const account = await provider.first() as MetamaskAccount;
          // @ts-ignore
          await (account?.signer as Signer).provider?.provider?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: EthereumChainIds[currentChainId] }]
          });
        }
      }));
      await fetchAccounts();
      localStorage.setItem(ConnectedAccountTypesKey, connectedProviders.join(';'));
    })();
  }, [api?.market, fetchAccounts, showSignDialog, currentChainId]);

  const connectProvider = useCallback(async (type: ProviderTypesName) => {
    const connectedProviders = (localStorage.getItem(ConnectedAccountTypesKey)?.split(';') || ['keyring']) as ProviderTypesName[];
    if (!connectedProviders.includes(type)) {
      connectedProviders.push(type);
      localStorage.setItem(ConnectedAccountTypesKey, connectedProviders.join(';'));
      await _accounts.addProvider<ProviderClass<any>>(
        ProviderTypes[type],
        type === 'keyring' ? { passwordCallback: showSignDialog } : undefined
      );
      await fetchAccounts();
    }
  }, [fetchAccounts]);

  const onClose = useCallback(() => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(undefined);
  }, []);

  const onSignFinish = useCallback((password: string | undefined) => {
    setIsSignModalVisible(false);
    onSignCallback.current && onSignCallback.current(password);
  }, []);

  const getAccountDeposit = useCallback(async (account: MarketAccount) => {
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
        account.balance = balance || { raw: new BN(0), parsed: '0', withdraw: { raw: new BN(0), parsed: '0' } };
      }
      return account;
    }));
  }, [api?.market, selectedAccount]);

  useEffect(() => {
    void updateCurrentAccountDeposit();
  }, [updateCurrentAccountDeposit]);

  const forgetAccount = useCallback((_address: string) => {
    keyring.forgetAccount(_address);
  }, [_accounts, accounts]);

  const value = useMemo(() => ({
    isLoading,
    isLoadingDeposits,
    accounts,
    selectedAccount,
    fetchAccountsError,
    isOpenConnectWalletModal,
    changeAccount,
    setSelectedAccount,
    showSignDialog,
    fetchAccounts,
    updateAccountsDeposits,
    updateCurrentAccountDeposit,
    setIsOpenConnectWalletModal,
    connectProvider,
    forgetAccount
  }), [
    isLoading,
    isLoadingDeposits,
    isOpenConnectWalletModal,
    accounts,
    fetchAccounts,
    updateAccountsDeposits,
    selectedAccount,
    fetchAccountsError,
    changeAccount,
    showSignDialog,
    updateCurrentAccountDeposit,
    setIsOpenConnectWalletModal,
    connectProvider,
    forgetAccount
  ]);

  return (
    <AccountProvider value={value}>
      {children}
      <SignModal
        keyringPair={localSignerKeyringPair}
        isVisible={isSignModalVisible}
        onClose={onClose}
        onFinish={onSignFinish}
      />
      <ConnectAccounts />
    </AccountProvider>
  );
};

export default AccountWrapper;
