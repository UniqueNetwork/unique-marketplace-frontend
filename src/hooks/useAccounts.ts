import { useCallback, useContext, useEffect } from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { stringToHex, u8aToHex } from '@polkadot/util';
import { KeypairType } from '@polkadot/util-crypto/types';

import { useApi } from './useApi';
import AccountContext, { Account, AccountSigner } from '../account/AccountContext';
import { getSuri, PairType } from '../utils/seedUtils';
import { TTransaction } from '../api/chainApi/types';

export const useAccounts = () => {
  const { rawRpcApi } = useApi();
  const {
    accounts,
    selectedAccount,
    isLoading,
    isLoadingDeposits,
    fetchAccountsError,
    changeAccount,
    setSelectedAccount,
    fetchAccounts,
    fetchAccountsWithDeposits,
    showSignDialog
  } = useContext(AccountContext);

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

  const unlockLocalAccount = useCallback((password: string, account?: Account) => {
    const _account = account || selectedAccount;
    if (!_account) throw new Error('Account was not provided');
    const pair = keyring.getPair(_account.address);
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
      const signature = await showSignDialog(_account);
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
      const pair = await showSignDialog(_account);
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
    isLoadingDeposits,
    fetchAccountsError,
    addLocalAccount,
    addAccountViaQR,
    unlockLocalAccount,
    signTx,
    signMessage,
    fetchAccounts,
    fetchAccountsWithDeposits,
    changeAccount
  };
};
