import { useAccounts } from 'hooks/useAccounts';

export const useBalanceInsufficient = (fee: string) => {
  const { selectedAccount } = useAccounts();

  return {
    isBalanceInsufficient: Number(selectedAccount?.balances?.proper.parsed || 0) < Number(fee)
  };
};
