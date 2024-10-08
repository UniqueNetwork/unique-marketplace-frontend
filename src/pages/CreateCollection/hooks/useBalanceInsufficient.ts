import { useMemo } from 'react';
import { useAccounts } from 'hooks/useAccounts';

export const useBalanceInsufficient = (sumFee: string) => {
  const { selectedAccount } = useAccounts();
  const isBalanceInsufficient = useMemo(() => {
    if (!sumFee || Number(sumFee) === 0) {
      return false;
    }

    const balance = Number(selectedAccount?.balances?.proper.parsed || 0);
    const feeValue = Number(sumFee);

    console.log('Account Balance:', balance);
    console.log('Sum Fee:', feeValue);

    if (!balance || !feeValue) {
      return false;
    }

    return balance < feeValue;
  }, [selectedAccount?.balances?.proper.parsed, sumFee]);

  return { isBalanceInsufficient };
};
