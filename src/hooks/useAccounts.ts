import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { useCallback, useContext, useEffect } from 'react';
import { sleep } from '../utils/helpers';
import { useApi } from './useApi';
import AccountContext, { Account, AccountSigner } from '../account/AccountContext';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';
import { DefaultAccountKey } from '../account/AccountProvider';

export const useAccounts = () => {
  const { rpcClient } = useApi();
  const { accounts, selectedAccount, isLoading, fetchAccountsError, changeAccount, setSelectedAccount, setAccounts, setIsLoading, setFetchAccountsError } = useContext(AccountContext);

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

  const getAccountBalance = useCallback(async (account: Account) => {
    if (!rpcClient?.isApiInitialized) return 0;
    const balances = await rpcClient?.rawKusamaRpcApi?.derive.balances?.all(account.address);
    return balances?.availableBalance || new BN(0);
  }, [rpcClient]);

  const getAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    const extensionAccounts = await getExtensionAccounts();
    const localAccounts = getLocalAccounts();

    const allAccounts: Account[] = [...extensionAccounts, ...localAccounts];

    return allAccounts;
  }, [getExtensionAccounts, getLocalAccounts]);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    // this call fires up the authorization popup
    const extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      setFetchAccountsError('No extension installed, or the user did not accept the authorization');
      return;
    }
    const allAccounts = await getAccounts();

    if (allAccounts?.length) {
      setAccounts(allAccounts);
      setIsLoading(false);

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
  }, [changeAccount, getAccounts]);

  useEffect(() => {
    void fetchAccounts();
  }, []);

  useEffect(() => {
    if (!rpcClient.isApiInitialized || !accounts?.length) return;
    const accountsWithBalancePromise = Promise.all(accounts.map(async (account: Account) => ({
      ...account,
      balance: {
        KSM: await getAccountBalance(account) // TODO: it's possible to subscribe on balances via rpc
      }
    } as Account)));
    // TODO: async setState in effects is dangerouse
    void accountsWithBalancePromise.then((accountsWithBalance: Account[]) => setAccounts(accountsWithBalance));
  }, [rpcClient.isApiInitialized, getAccountBalance]);

  useEffect(() => {
    const updatedSelectedAccount = accounts.find((account) => account.address === selectedAccount?.address);
    if (updatedSelectedAccount) setSelectedAccount(updatedSelectedAccount);
  }, [accounts]);

  return {
    accounts,
    selectedAccount,
    isLoading,
    fetchAccountsError,
    changeAccount
  };
};
