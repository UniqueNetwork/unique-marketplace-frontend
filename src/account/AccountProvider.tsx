import React, { FC, useCallback, useMemo, useState } from 'react';

import { Account, AccountProvider } from './AccountContext';

export const DefaultAccountKey = 'unique_market_account_address';

const AccountWrapper: FC = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<Account>();

  const changeAccount = useCallback((account: Account) => {
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(account);
  }, []);

  const value = useMemo(() => ({
    isLoading,
    accounts,
    selectedAccount,
    fetchAccountsError,
    changeAccount,
    setSelectedAccount,
    setFetchAccountsError,
    setAccounts,
    setIsLoading
  }), [isLoading, accounts, selectedAccount, fetchAccountsError, changeAccount]);

  return (
    <AccountProvider value={value}>
      {children}
    </AccountProvider>
  );
};

export default AccountWrapper;
