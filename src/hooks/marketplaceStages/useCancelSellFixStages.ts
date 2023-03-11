import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TDelistProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useCancelSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const delistStages: InternalStage<TDelistProps>[] = useMemo(() => [
    {
      title: 'Remove allowance from contract',
      description: '',
      status: StageStatus.default,
      action: ({ options }) => marketApi?.changeAllowance(collectionId, tokenId, false, options)
    },
    {
      title: 'Cancel order',
      description: '',
      status: StageStatus.default,
      action: ({ options }) => marketApi?.cancelFix(collectionId, tokenId, 1, options)
    }
  ], [marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TDelistProps>(delistStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
