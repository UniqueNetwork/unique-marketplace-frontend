import { CreateCollectionBody, CreateTokenPayload } from '@unique-nft/sdk';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { truncateDecimalsBalanceSheet } from 'utils/helpers';

export const useCreateMultipleTokens = () => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [fee, setFee] = useState<string>();
  const [feeError, setFeeError] = useState<string>();
  const [submitWaitResultError, setSubmitWaitResultError] = useState<string>();
  const [feeLoading, setFeeLoading] = useState(false);
  const [isLoadingSubmitResult, setIsLoadingSubmitResult] = useState(false);

  const submitWaitResult = useCallback(async ({ payload }: { payload: {
    tokens: CreateTokenPayload[],
    collectionId: number,
  } }) => {
    if (!api || !selectedAccount) return;
    setIsLoadingSubmitResult(true);
    const response = await api?.nft?.create(payload, { account: selectedAccount });
    setIsLoadingSubmitResult(false);
    return response;
  }, [api, selectedAccount]);

  const getFee = useCallback(async ({ payload }: { payload: CreateCollectionBody }) => {
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
