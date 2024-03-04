import { useCallback, useEffect, useState } from 'react';
import { useAccounts } from './useAccounts';

type useAccountsFilterProps = {
  excluded?: string[]
}

export const useAccountsFilter = ({ excluded }: useAccountsFilterProps = { excluded: [] }) => {
  const { accounts } = useAccounts();
  const [filteredAccounts, setFilteredAccounts] = useState([...accounts.values()]);

  useEffect(() => {
    setFilteredAccounts([...accounts.values()].filter(({ address }) => !excluded?.includes(address)));
  }, []);

  const onFilter = useCallback((input: string) => {
    setFilteredAccounts([...accounts.values()].filter((account) => {
      if (excluded?.includes(account.address)) return false;
      return account.address.toLowerCase().includes(input.toLowerCase()) || account.name?.toLowerCase().includes(input.toLowerCase());
    }));
  }, [excluded, accounts]);

  const onReset = useCallback(() => {
    setFilteredAccounts([...accounts.values()].filter(({ address }) => !excluded?.includes(address)));
  }, [excluded, accounts]);

  return {
    filteredAccounts,
    onFilter,
    onReset
  };
};
