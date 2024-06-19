import { CreateCollectionBody, TokenV2ItemForMultipleDto } from '@unique-nft/sdk';
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

  const submitWaitResult = useCallback(async ({ payload, schemaVersion }: { 
    payload: {
      tokens: TokenV2ItemForMultipleDto[],
      collectionId: number,
    },
    schemaVersion?: string
  }) => {
    if (!api || !selectedAccount) return;
    setIsLoadingSubmitResult(true);
    const response = schemaVersion === '1.0.0'
      ? await api?.nft?.createV1(payload, { account: selectedAccount })
      : await api?.nft?.create(payload, { account: selectedAccount });
    setIsLoadingSubmitResult(false);
    return response;
  }, [api, selectedAccount]);

  const getFee = useCallback(async ({ payload }: { payload: CreateCollectionBody }) => {
    if (!api || !selectedAccount) return;
    setFeeLoading(true);
    const fee = '0'; // await api?.nft?.get(payload, { account: selectedAccount });
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
