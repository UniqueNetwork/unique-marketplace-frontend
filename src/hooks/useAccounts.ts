import { useCallback, useContext, useEffect, useState } from 'react';
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

export const useAccounts = () => {
  const { rpcClient, rawRpcApi, api } = useApi();
  const {
    accounts,
    selectedAccount,
    isLoading,
    fetchAccountsError,
    changeAccount,
    setSelectedAccount,
    setAccounts,
    setIsLoading,
    setFetchAccountsError,
    showSignDialog
  } = useContext(AccountContext);

  // TODO: move fetching accounts and balances into context

  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const getExtensionAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    let extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      console.log('Extension not found, retry in 1s');
      await sleep(1000);
      extensions = await web3Enable('my cool dapp');
      if (extensions.length === 0) {
        // alert('no extension installed, or the user did not accept the authorization');
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

  const fetchAccounts = useCallback(async () => {
    if (!rpcClient?.isKusamaApiConnected) return;
    setIsLoading(true);
    // this call fires up the authorization popup
    const extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      setFetchAccountsError('No extension installed, or the user did not accept the authorization');
      return;
    }
    const allAccounts = await getAccounts();

    if (allAccounts?.length) {
      const accountsWithBalance = await getAccountsBalances(allAccounts);
      const accountsWithDeposits = await getAccountsDeposits(accountsWithBalance);

      setAccounts(accountsWithDeposits);

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

  const fetchBalances = useCallback(async () => {
    setIsLoadingBalances(true);
    const accountsWithBalance = await getAccountsBalances(accounts);
    setIsLoadingBalances(false);
    setAccounts(accountsWithBalance);
  }, [getAccountBalance, accounts]);

  const updateAccountBalance = useCallback(async () => {
    if (!selectedAccount) return;
    setIsLoadingBalances(true);
    const balanceKSM = await getAccountBalance(selectedAccount);
    setAccounts(accounts.map((account: Account) => {
      if (account.address === selectedAccount.address) {
        return { ...account, balance: { KSM: balanceKSM } } as Account;
      }
      return account;
    }));
    setIsLoadingBalances(false);
  }, [selectedAccount, accounts]);

  useEffect(() => {
    const updatedSelectedAccount = accounts.find((account) => account.address === selectedAccount?.address);
    if (updatedSelectedAccount) setSelectedAccount(updatedSelectedAccount);
  }, [accounts, setSelectedAccount, selectedAccount]);

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

  return {
    accounts,
    selectedAccount,
    isLoading,
    isLoadingBalances,
    fetchAccountsError,
    addLocalAccount,
    addAccountViaQR,
    unlockLocalAccount,
    signTx,
    signMessage,
    fetchAccounts,
    fetchBalances,
    updateAccountBalance,
    changeAccount
  };
};
