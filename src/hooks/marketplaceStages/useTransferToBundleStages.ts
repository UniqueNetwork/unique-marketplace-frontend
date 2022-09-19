import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TUnnest } from 'pages/Token/BundleModals/types';
import { INestedTokenId } from 'components/BundleTree/types';

export const useTransferToBundleStages = (token: INestedTokenId, parent: INestedTokenId) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const nftApi = api?.nft;
  const unnestStages: InternalStage<TUnnest>[] = useMemo(() => [{
    title: 'Transfer in progress',
    description: '',
    status: StageStatus.default,
    action: (params) => nftApi?.transferToBundle(params.txParams.accountAddress, token, parent, params.options)
  }], [nftApi, token, parent]);
  const { stages, error, status, initiate } = useStages<TUnnest>(unnestStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
