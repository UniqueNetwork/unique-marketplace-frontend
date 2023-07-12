import { useMemo } from 'react';
import { TokenIdQuery } from '@unique-nft/sdk';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { CollectionMode } from 'api/chainApi/types';

export const useUnnestStages = (token: TokenIdQuery, parentAddress: string, mode: CollectionMode) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const nftApi = api?.nft;
  const unnestStages: InternalStage<{ amount: number }>[] = useMemo(() => [{
    title: 'Unnest in progress',
    description: '',
    status: StageStatus.inProgress,
    action: (params) => nftApi?.unnest(Number(token.collectionId), token.tokenId, parentAddress, mode, params.txParams.amount, params.options)
  }], [nftApi, token.collectionId, token.tokenId, parentAddress, mode]);

  const { stages, error, status, initiate } = useStages<{ amount: number }>(unnestStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
