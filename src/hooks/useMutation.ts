import { TransactionOptions } from 'api/chainApi/types';
import { useNotifications } from 'components/UI';
import { useAccounts } from 'hooks/useAccounts';
import { useCallback, useState } from 'react';
import { truncateDecimalsBalanceSheet } from 'utils/helpers';

export function useMutation<P, R>({ mutation, getFee }: {
  mutation?: (payload: P, options: TransactionOptions) => Promise<R>
  getFee?: (payload: P, options: TransactionOptions) => Promise<string>
}) {
  const { error } = useNotifications();
  const { selectedAccount } = useAccounts();
  const [fee, setFee] = useState<string>();
  const [feeError, setFeeError] = useState<string>();
  const [submitWaitResultError, setSubmitWaitResultError] = useState<string>();
  const [feeLoading, setFeeLoading] = useState(false);
  const [isLoadingSubmitResult, setIsLoadingSubmitResult] = useState(false);

  const submitWaitResult = useCallback(async ({ payload }: { payload: P }) => {
    if (!mutation || !selectedAccount) return;
    setIsLoadingSubmitResult(true);
    try {
      const response = await mutation(payload, { account: selectedAccount });
      setIsLoadingSubmitResult(false);
      return response;
    } catch (err: any) {
      const errorMessage = err.message;
      setIsLoadingSubmitResult(false);
      setSubmitWaitResultError(errorMessage);
      error(errorMessage);
      throw err;
    }
  }, [selectedAccount, mutation]);

  const getFeeCallback = useCallback(async ({ payload }: { payload: P }) => {
    if (!getFee || !selectedAccount) return;
    setFeeLoading(true);
    try {
      const fee = await getFee(payload, { account: selectedAccount });
      setFee(fee);
      setFeeLoading(false);
    } catch (err: any) {
      const errorMessage = err.message;
      setFeeError(errorMessage);
      setFeeLoading(false);
      error(errorMessage);
    }
  }, [selectedAccount, getFee]);

  return {
    getFee: getFeeCallback,
    fee,
    feeFormatted: truncateDecimalsBalanceSheet(fee),
    feeLoading,
    submitWaitResult,
    isLoadingSubmitResult,
    feeError,
    submitWaitResultError
  };
}
