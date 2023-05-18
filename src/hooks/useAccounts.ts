import { useCallback, useContext, useEffect } from 'react';
import keyring from '@polkadot/ui-keyring';
import { KeypairType } from '@polkadot/util-crypto/types';

import { useApi } from './useApi';
import AccountContext from 'account/AccountContext';
import { getSuri, PairType } from 'utils/seedUtils';

export const useAccounts = () => {
  const { api, chainProperties } = useApi();
  const {
    accounts,
    selectedAccount,
    isLoading,
    isLoadingDeposits,
    fetchAccountsError,
    changeAccount,
    setSelectedAccount,
    fetchAccounts,
    updateAccountsDeposits,
    updateCurrentAccountDeposit,
    forgetAccount
  } = useContext(AccountContext);

  useEffect(() => {
    const updatedSelectedAccount = accounts.find((account) => account.address === selectedAccount?.address);
    if (updatedSelectedAccount) setSelectedAccount(updatedSelectedAccount);
  }, [accounts, setSelectedAccount, selectedAccount, api]);

  const addLocalAccount = useCallback((seed: string, derivePath: string, name: string, password: string, pairType: PairType) => {
    const options = { genesisHash: chainProperties?.genesisHash, isHardware: false, name: name.trim(), tags: [] };
    keyring.addUri(getSuri(seed, derivePath, pairType), password, options, pairType as KeypairType);
  }, [chainProperties]);

  const deleteLocalAccount = useCallback((address: string) => {
    forgetAccount(address);
  }, [forgetAccount]);

  return {
    accounts,
    selectedAccount,
    isLoading,
    isLoadingDeposits,
    fetchAccountsError,
    addLocalAccount,
    fetchAccounts,
    updateAccountsDeposits,
    updateCurrentAccountDeposit,
    changeAccount,
    deleteLocalAccount
  };
};
