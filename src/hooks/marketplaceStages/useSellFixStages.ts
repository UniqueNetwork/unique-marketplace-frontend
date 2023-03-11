import { useMemo } from 'react';

import { useApi } from '../useApi';
import { TEnableAllowanceProps, TFixPriceProps } from 'pages/Token/Modals/types';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';

export const useSellFixStages = (collectionId: number, tokenId: number) => {
  const { api, baseURL } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;

  const sellFixStages: InternalStage<TFixPriceProps>[] = useMemo(() => [
  {
    title: 'Provide allowance to contract',
    description: '',
    status: StageStatus.default,
    action: ({ options }) => marketApi?.changeAllowance(collectionId, tokenId, true, options)
  },
  {
    title: 'Putting token on sale',
    description: '',
    status: StageStatus.default,
    action: ({ txParams, options }) => marketApi?.sellFix(collectionId, tokenId, Number(txParams.price), 1, options) // TODO: price string -> number
  }], [selectedAccount?.isOnWhiteList, marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TFixPriceProps>(sellFixStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
