import { CreateCollectionV2ArgsDto } from '@unique-nft/sdk';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { truncateDecimalsBalanceSheet } from 'utils/helpers';

export const useCollectionCreate = () => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [fee, setFee] = useState<string>();
  const [feeError, setFeeError] = useState<string>();
  const [submitWaitResultError, setSubmitWaitResultError] = useState<string>();
  const [feeLoading, setFeeLoading] = useState(false);
  const [isLoadingSubmitResult, setIsLoadingSubmitResult] = useState(false);

  const submitWaitResult = useCallback(async ({ payload }: { payload: CreateCollectionV2ArgsDto }) => {
    if (!api || !selectedAccount) return;
    setIsLoadingSubmitResult(true);
    const response = await api?.collection?.createCollection(payload, { account: selectedAccount });
    setIsLoadingSubmitResult(false);
    return response;
  }, [api, selectedAccount]);

  const getFee = useCallback(async ({ payload }: { payload: CreateCollectionV2ArgsDto }) => {
    if (!api || !selectedAccount) return;
    setFeeLoading(true);
    const fee = await api?.collection?.getCreateCollectionFee(payload, { account: selectedAccount });
    setFee(fee);
    setFeeLoading(false);
  }, [api, selectedAccount]);

  return {
    getFee,
    fee,
    feeFormatted: truncateDecimalsBalanceSheet(fee),
    feeLoading,
    submitWaitResult,
    isLoadingSubmitResult,
    feeError,
    submitWaitResultError
  };
};
