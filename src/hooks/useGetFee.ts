import { useCallback, useState } from 'react';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

interface UseFeeReturn<P extends any[]> {
  fee: string;
  fetchingFee: boolean;
  error: string | null;
  getFee: (...args: P) => Promise<string | undefined>;
}

interface GetFeeMethod<P extends any[]> {
  (...args: P): Promise<string>;
}

export const useGetFee = <P extends any[]>(getFeeMethod: GetFeeMethod<P> | undefined): UseFeeReturn<P> => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [fee, setFee] = useState<string>('0');
  const [fetchingFee, setFetchingFee] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getFee = useCallback(async (...args: P) => {
    if (!selectedAccount || !api?.market || !getFeeMethod) return;

    setFetchingFee(true);
    setError(null);

    try {
      const fee = await getFeeMethod(...args);
      setFee(fee || '0');
      return fee || '0';
    } catch (err) {
      const errorMsg = (err as Error).message || 'Unknown error occurred';
      console.error('Error fetching fee:', errorMsg);
      setError(errorMsg);
    } finally {
      setFetchingFee(false);
    }
  }, [api, selectedAccount, getFeeMethod]);

  return { fee, fetchingFee, error, getFee };
};
