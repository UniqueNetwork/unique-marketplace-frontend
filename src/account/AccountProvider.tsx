import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { sleep } from '../utils/helpers';
import { AccountProvider } from './AccountContext';

const DefaultAccountKey = 'unique_market_account_address';

const AccountWrapper: FC = ({ children }) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>();

  const getAccounts = async () => {
    // this call fires up the authorization popup
    let extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      console.log('Extension not found, retry in 1s');
      await sleep(1000);
      extensions = await web3Enable('my cool dapp');
      if (extensions.length === 0) {
        alert('no extension installed, or the user did not accept the authorization');
        return;
      }
    }

    const allAccounts = await web3Accounts();

    return { allAccounts };
  };

  useEffect(() => {
    getAccounts().then((result) => {
      if (result?.allAccounts?.length ? result.allAccounts.length > 0 : false) {
        const accounts = result?.allAccounts;

        setAccounts(accounts || []);
        setIsLoading(false);

        if (!accounts || accounts.length === 0) return;

        const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
        const defaultAccount = accounts.find((item) => item.address === defaultAccountAddress);

        if (defaultAccount) {
          setSelectedAccount(defaultAccount);
        } else {
          setSelectedAccount(accounts[0]);
        }
      } else {
        alert('you have got not account');
      }
    }, (reason) => {
      console.log('reason', reason);
    });
  }, []);

  const onSelectAccount = useCallback((account: InjectedAccountWithMeta) => {
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(account);
  }, []);

  const value = useMemo(() => ({
    isLoading,
    accounts,
    selectedAccount,
    onSelectAccount
  }), [isLoading, accounts, selectedAccount, setSelectedAccount]);

  return (
    <AccountProvider value={value}>
      {children}
    </AccountProvider>
  );
};

export default AccountWrapper;
