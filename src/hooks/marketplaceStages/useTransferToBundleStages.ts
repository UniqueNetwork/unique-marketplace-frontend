import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TokenIdArguments } from '@unique-nft/substrate-client/tokens';

export const useTransferToBundleStages = (token: TokenIdArguments, parent: TokenIdArguments) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const nftApi = api?.nft;
  const transferStages: InternalStage<null>[] = useMemo(() => [
    {
      title: 'Transfer in progress',
      description: '',
      status: StageStatus.default,
      action: (params) => nftApi?.transferToBundle(token, parent, params.options)
    }
  ], [nftApi, token, parent]);
  const { stages, error, status, initiate } = useStages<null>(transferStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
