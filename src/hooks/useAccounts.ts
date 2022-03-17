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
    if (!rpcClient?.isApiInitialized || !api) return 0;
    const balances = await rpcClient?.rawKusamaRpcApi?.derive.balances?.all(account.address);
    return balances?.availableBalance || new BN(0);
  }, [rpcClient, api]);

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

  const addAccountViaQR = useCallback((scanned: { name: string, isAddress: boolean, content: string, password: string, genesisHash: string}) => {
    const { name, isAddress, content, password, genesisHash } = scanned;

    const meta = {
      genesisHash: genesisHash || rawRpcApi?.genesisHash.toHex(),
      name: name?.trim()
    };
    const account = isAddress
      ? keyring.addExternal(content, meta).pair.address
      : keyring.addUri(content, password, meta, 'sr25519').pair.address;
  }, [rawRpcApi]);

  const unlockLocalAccount = useCallback((password: string) => {
    if (!selectedAccount) return;
    const signature = keyring.getPair(selectedAccount.address);
    signature.unlock(password);
    return signature;
  }, [selectedAccount]);

  const signTx = useCallback(async (tx: TTransaction, account?: Account): Promise<TTransaction> => {
    const _account = account || selectedAccount;
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
  }, [showSignDialog, selectedAccount]);

  const signMessage = useCallback(async (message: string, account?: Account): Promise<string> => {
    const _account = account || selectedAccount;
    if (!_account) throw new Error('Account was not provided');
    let signedMessage;
    if (_account.signerType === AccountSigner.local) {
      const signature = await showSignDialog();
      if (signature) {
        signedMessage = u8aToString(signature.sign(message));
      }
    } else {
      const injector = await web3FromSource(_account.meta.source);
      if (!injector.signer.signRaw) throw new Error('Web3 not available');

      const { signature } = await injector.signer.signRaw({ address: _account.address, type: 'bytes', data: stringToHex(message) });
      signedMessage = signature;
    }
    if (!signedMessage) throw new Error('Signing failed');
    return signedMessage;
  }, [showSignDialog, selectedAccount]);

  return {
    accounts,
    selectedAccount,
    fetchAccounts,
    isLoading,
    fetchAccountsError,
    addLocalAccount,
    addAccountViaQR,
    unlockLocalAccount,
    signTx,
    signMessage,
    changeAccount
  };
};
