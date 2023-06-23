import { useMemo } from 'react';
import { TokenIdQuery } from '@unique-nft/sdk';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';

export const useUnnestStages = (token: TokenIdQuery) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const nftApi = api?.nft;
  const unnestStages: InternalStage<null>[] = useMemo(() => [{
    title: 'Unnest in progress',
    description: '',
    status: StageStatus.inProgress,
    action: (params) => nftApi?.unnest(Number(token.collectionId), token.tokenId, 1, params.options)
  }], [nftApi, token.collectionId, token.tokenId]);

  const { stages, error, status, initiate } = useStages<null>(unnestStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
