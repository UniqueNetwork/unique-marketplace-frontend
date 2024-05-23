import { useMemo } from 'react';

import { useApi } from '../useApi';
import { TFixPriceProps } from 'pages/Token/Modals/types';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';

export const useChangePriceStages = (collectionId: number, tokenId: number, contractAddress?: string) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;

  const sellFixStages: InternalStage<TFixPriceProps>[] = useMemo(() => [
  {
    title: 'Change price',
    description: '',
    status: StageStatus.default,
    action: ({ txParams, options }) => marketApi?.changePrice(collectionId, tokenId, Number(txParams.price), txParams.currency, { ...options, contractAddress })
  }], [selectedAccount, marketApi, collectionId, tokenId, contractAddress]);
  const { stages, error, status, initiate } = useStages<TFixPriceProps>(sellFixStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
