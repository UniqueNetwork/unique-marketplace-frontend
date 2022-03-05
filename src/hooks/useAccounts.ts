import { useCallback, useContext, useEffect } from 'react';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { BN, stringToHex, u8aToString } from '@polkadot/util';
import { KeypairType } from '@polkadot/util-crypto/types';

import { sleep } from '../utils/helpers';
import { useApi } from './useApi';
import AccountContext, { Account, AccountSigner } from '../account/AccountContext';
import { DefaultAccountKey } from '../account/AccountProvider';
import { getSuri, PairType } from '../utils/seedUtils';
import { TTransaction } from '../api/chainApi/types';

export const useAccounts = () => {
  const { rpcClient, rawRpcApi } = useApi();
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

  const addLocalAccount = useCallback((seed: string, derivePath: string, name: string, password: string, pairType: PairType) => {
    const options = { genesisHash: rawRpcApi?.genesisHash.toString(), isHardware: false, name: name.trim(), tags: [] };
    keyring.addUri(getSuri(seed, derivePath, pairType), password, options, pairType as KeypairType);
  }, []);

  const unlockLocalAccount = useCallback((password: string) => {
    if (!selectedAccount) return;
    const signature = keyring.getPair(selectedAccount.address);
    signature.unlock(password);
    return signature;
  }, [selectedAccount]);

  const signTx = useCallback((tx: TTransaction): Promise<TTransaction> => {
    if (!selectedAccount) throw new Error('Invalid account');

    return new Promise<TTransaction>(async (resolve, reject) => {
      if (selectedAccount.signerType === AccountSigner.local) {
        showSignDialog((signature) => {
          if (signature) {
            const signedTx = tx.signAsync(signature);
            resolve(signedTx);
            return;
          }
          reject();
        });
        return;
      }
      try {
        const injector = await web3FromSource(selectedAccount.meta.source);
        const signedTx = await tx.signAsync(selectedAccount.address, { signer: injector.signer });
        resolve(signedTx);
      } catch (e) {
        reject(e);
      }
    });
  }, [showSignDialog, selectedAccount]);

  const signMessage = useCallback((message: string): Promise<string> => {
    if (!selectedAccount) throw new Error('Invalid account');

    return new Promise<string>(async (resolve, reject) => {
      if (selectedAccount.signerType === AccountSigner.local) {
        showSignDialog((signature) => {
          if (signature) {
            const signedMessage = signature.sign(message);
            resolve(u8aToString(signedMessage));
            return;
          }
          reject();
        });
        return;
      }
      try {
        const injector = await web3FromSource(selectedAccount.meta.source);
        if (!injector.signer.signRaw) {
          reject(new Error('Web3 not available'));
          return;
        }

        const { signature } = await injector.signer.signRaw({ address: selectedAccount.address, type: 'bytes', data: stringToHex(message) });
        resolve(signature);
      } catch (e) {
        reject(e);
      }
    });
  }, [showSignDialog, selectedAccount]);

  return {
    accounts,
    selectedAccount,
    isLoading,
    fetchAccountsError,
    addLocalAccount,
    unlockLocalAccount,
    signTx,
    signMessage,
    changeAccount
  };
};
