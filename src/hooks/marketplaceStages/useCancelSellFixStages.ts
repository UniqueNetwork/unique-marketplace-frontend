import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TDelistProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useCancelSellFixStages = (collectionId: number, tokenId: number, contractAddress: string) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const delistStages: InternalStage<TDelistProps>[] = useMemo(() => [
    {
      title: 'Remove allowance from contract',
      description: '',
      status: StageStatus.default,
      action: ({ options }) => {
        return marketApi?.revokeTokenSell({collectionId, tokenId, contractProps: { ...options, contractAddress }});
      }
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
