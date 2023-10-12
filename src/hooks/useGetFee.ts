import { useCallback, useState } from 'react';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

interface UseFeeReturn<P extends any[]> {
  fee: string,
  fetchingFee: boolean,
  getFee: (...args: P) => Promise<string | undefined>
}

interface GetFeeMethod<P extends any[]> {
  (...args: P): Promise<string>;
}

export const useGetFee = <P extends any[]>(getFeeMethod: GetFeeMethod<P> | undefined): UseFeeReturn<P> => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [fee, setFee] = useState<string>('0');
  const [fetchingFee, setFetchingFee] = useState<boolean>(false);

  const getFee = useCallback(async (...args: P) => {
    if (!selectedAccount || !api?.market || !getFeeMethod) return;
    setFetchingFee(true);
    const fee = await getFeeMethod(...args);
    setFee(fee || '0');
    setFetchingFee(false);
    return fee || '0';
  }, [api, selectedAccount, getFeeMethod]);

  return { fee, fetchingFee, getFee };
};
