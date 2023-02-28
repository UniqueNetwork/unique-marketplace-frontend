import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TokenIdArguments } from '@unique-nft/substrate-client/tokens';

export const useUnnestStages = (token: TokenIdArguments) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const nftApi = api?.nft;
  const unnestStages: InternalStage<null>[] = useMemo(() => [{
    title: 'Unnest in progress',
    description: '',
    status: StageStatus.inProgress,
    action: (params) => nftApi?.unnest(token.collectionId, token.tokenId, selectedAccount?.getAddress() || '', params.options)
  }], [nftApi, token]);
  const { stages, error, status, initiate } = useStages<null>(unnestStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
