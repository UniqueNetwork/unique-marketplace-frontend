import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { BN, stringToHex, u8aToHex } from '@polkadot/util';
import { KeypairType } from '@polkadot/util-crypto/types';

import { sleep } from '../utils/helpers';
import { useApi } from './useApi';
import AccountContext, { Account, AccountSigner } from '../account/AccountContext';
import { DefaultAccountKey } from '../account/AccountProvider';
import { getSuri, PairType } from '../utils/seedUtils';
import { TTransaction } from '../api/chainApi/types';
import { Codec } from '@polkadot/types/types';

export const useAccounts = () => {
  const { rpcClient, rawRpcApi, rawKusamaRpcApi, api } = useApi();
  const {
    accounts,
    selectedAccount,
    isLoading,
    fetchAccountsError,
    hasAdminPermission,
    changeAccount,
    setSelectedAccount,
    setAccounts,
    setIsLoading,
    setFetchAccountsError,
    setHasAdminPermission,
    showSignDialog
  } = useContext(AccountContext);

  // TODO: move fetching accounts and balances into context

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
    const balances = await rpcClient?.rawKusamaRpcApi?.derive.balances?.all(account.address);
    return balances?.availableBalance || new BN(0);
  }, [rpcClient]);

  const getAccountsBalances = useCallback(async (accounts: Account[]) => Promise.all(accounts.map(async (account: Account) => ({
    ...account,
    balance: {
      KSM: await getAccountBalance(account) // TODO: it's possible to subscribe on balances via rpc
    }
  } as Account))), [getAccountBalance]);

  const getAccountsDeposits = useCallback((accounts: Account[]) => {
    if (!api?.market) return accounts;
    const fetchDeposit = async (account: Account) => ({
      ...account,
      deposit: await api?.market?.getUserDeposit(account.address),
      isOnWhiteList: await api?.market?.checkWhiteListed(account.address)
    });
    return Promise.all(accounts.map(fetchDeposit));
  }, [api?.market]);

  const unsubscribesBalancesChanges = useRef<Record<string, Codec>>({});
  const subscribeBalancesChanges = useCallback(async (accounts: Account[]) => {
    if (!rawKusamaRpcApi) return;

    const unsubscribes = await Promise.all(accounts.map(async (account) => {
      const unsubscribe = await rawKusamaRpcApi.query.system.account(account.address, ({ data: { free } }: { data: { free: BN } }) => {
        if (!account.balance?.KSM || !free.sub(account.balance.KSM).isZero()) {
          setAccounts(accounts.map((_account: Account) => ({
            ..._account,
            balance: account.address === _account.address ? { KSM: free } : _account.balance
          })));
        }
      });
      return { [account.address]: unsubscribe };
    }));

    unsubscribesBalancesChanges.current = unsubscribes.reduce<Record<string, Codec>>((acc, item) => ({ ...acc, ...item }), {});
  }, [rawKusamaRpcApi]);

  const fetchAccounts = useCallback(async () => {
    if (!rpcClient?.isKusamaApiConnected) return;
    setIsLoading(true);

    const allAccounts = await getAccounts();

    if (allAccounts?.length) {
      const accountsWithBalance = await getAccountsBalances(allAccounts);
      const accountsWithDeposits = await getAccountsDeposits(accountsWithBalance);

      setAccounts(accountsWithDeposits);

      await subscribeBalancesChanges(accountsWithDeposits);

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
  }, [rpcClient?.isKusamaApiConnected]);

  useEffect(() => {
    const updatedSelectedAccount = accounts.find((account) => account.address === selectedAccount?.address);
    if (updatedSelectedAccount) setSelectedAccount(updatedSelectedAccount);
  }, [accounts, setSelectedAccount, selectedAccount, rawRpcApi]);

  const addLocalAccount = useCallback((seed: string, derivePath: string, name: string, password: string, pairType: PairType) => {
    const options = { genesisHash: rawRpcApi?.genesisHash.toString(), isHardware: false, name: name.trim(), tags: [] };
    keyring.addUri(getSuri(seed, derivePath, pairType), password, options, pairType as KeypairType);
  }, [rawRpcApi]);

  const addAccountViaQR = useCallback((scanned: { name: string, isAddress: boolean, content: string, password: string, genesisHash: string}) => {
    const { name, isAddress, content, password, genesisHash } = scanned;

    const meta = {
      genesisHash: genesisHash || rawRpcApi?.genesisHash.toHex(),
      name: name?.trim()
    };
    if (isAddress) keyring.addExternal(content, meta);
    else keyring.addUri(content, password, meta, 'sr25519');
  }, [rawRpcApi]);

  const unlockLocalAccount = useCallback((password: string) => {
    if (!selectedAccount) return;
    const pair = keyring.getPair(selectedAccount.address);
    pair.unlock(password);
    return pair;
  }, [selectedAccount]);

  const signTx = useCallback(async (tx: TTransaction, account?: Account | string): Promise<TTransaction> => {
    let _account = account || selectedAccount;
    if (typeof _account === 'string') {
      _account = accounts.find((account) => account.address === _account);
    }

    if (!_account) throw new Error('Account was not provided');
    let signedTx;
    if (_account.signerType === AccountSigner.local) {
      const signature = await showSignDialog();
      if (signature) {
        signedTx = await tx.signAsync(signature);
      }
    } else {
      const injector = await web3FromSource(_account.meta.source);
      signedTx = await tx.signAsync(_account.address, { signer: injector.signer });
    }
    if (!signedTx) throw new Error('Signing failed');
    return signedTx;
  }, [showSignDialog, selectedAccount, accounts]);

  const signMessage = useCallback(async (message: string, account?: Account | string): Promise<string> => {
    let _account = account || selectedAccount;
    if (typeof _account === 'string') {
      _account = accounts.find((account) => account.address === _account);
    }

    if (!_account) throw new Error('Account was not provided');
    let signedMessage;
    if (_account.signerType === AccountSigner.local) {
      const pair = await showSignDialog();
      if (pair) {
        signedMessage = u8aToHex(pair.sign(stringToHex(message)));
      }
    } else {
      const injector = await web3FromSource(_account.meta.source);
      if (!injector.signer.signRaw) throw new Error('Web3 not available');

      const { signature } = await injector.signer.signRaw({ address: _account.address, type: 'bytes', data: stringToHex(message) });
      signedMessage = signature;
    }
    if (!signedMessage) throw new Error('Signing failed');
    return signedMessage;
  }, [showSignDialog, selectedAccount, accounts]);

  const checkCookie = () => {
    const cookieName = 'session';
    const matches = document.cookie.match(new RegExp(
      `(?:^|; )${cookieName}=([^;]*)`
    ));

    return !!matches;
  };

  useEffect(() => {
    if (checkCookie()) {
      setHasAdminPermission(true);
    } else {
      // TODO: send request to get JWT cookie
      new Promise<void>((resolve) => {
        // set mock cookie
        document.cookie = 'session=alsh12d218eh17ASgjkenqeKLHA';
        resolve();
      }).then(() => {
        setHasAdminPermission(checkCookie());
      });
    }
  }, [selectedAccount]);

  return {
    accounts,
    selectedAccount,
    isLoading,
    fetchAccountsError,
    addLocalAccount,
    addAccountViaQR,
    unlockLocalAccount,
    signTx,
    signMessage,
    fetchAccounts,
    subscribeBalancesChanges,
    hasAdminPermission,
    changeAccount
  };
};
