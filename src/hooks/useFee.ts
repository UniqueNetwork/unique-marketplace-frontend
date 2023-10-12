import { useCallback, useState } from 'react';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

interface UseFeeReturn {
  transferBalanceFee: string,
  fetchingTransferBalanceFee: boolean,
  /**
   * value in human format
   */
  getTransferBalanceFee: (recipient: string, value: number | string) => Promise<string | undefined>
}

export const useFee = (): UseFeeReturn => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [transferBalanceFee, setTransferBalanceFee] = useState<string>('0');
  const [fetchingTransferBalanceFee, setFetchingTransferBalanceFee] = useState<boolean>(false);

  const getTransferBalanceFee = useCallback(async (recipient: string, value: number | string) => {
    if (!selectedAccount || !api?.market) return;
    setFetchingTransferBalanceFee(true);
    const fee = await api.market.getTransferBalanceFee(selectedAccount.address, recipient, Number(value), { account: selectedAccount });
    setTransferBalanceFee(fee || '0');
    setFetchingTransferBalanceFee(false);
    return fee || '0';
  }, [api, selectedAccount]);

  // TODO: fill it correctly
  const royaltyFee = '0';

  return { transferBalanceFee, fetchingTransferBalanceFee, getTransferBalanceFee };
};
