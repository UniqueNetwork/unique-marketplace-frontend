import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TokenIdQuery } from '@unique-nft/sdk';
import { CollectionMode } from 'api/chainApi/types';

export const useTransferToBundleStages = (owner: string, token: TokenIdQuery, parent: TokenIdQuery, mode: CollectionMode) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const nftApi = api?.nft;
  const transferStages: InternalStage<{ amount: number }>[] = useMemo(() => [
    {
      title: 'Transfer in progress',
      description: '',
      status: StageStatus.default,
      action: (params) => nftApi?.transferToBundle(owner, token, parent, mode, params.txParams.amount, params.options)
    }
  ], [nftApi, token, parent, owner, mode]);
  const { stages, error, status, initiate } = useStages<{ amount: number }>(transferStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
