import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useAcceptSponsorshipStages = (collectionId: number) => {
  const { api } = useApi();
  const { signTx } = useAccounts();
  const collectionApi = api?.collection;
  const acceptSponsorshipStages: InternalStage<null>[] = useMemo(() => [{
    title: 'Accepting sponsorship',
    description: '',
    status: StageStatus.default,
    action: (params) => collectionApi?.confirmSponsorship(collectionId, params.options)
  }], [collectionApi]);

  const { stages, error, status, initiate } = useStages<null>(acceptSponsorshipStages, signTx);

  return {
    stages,
    error,
    status,
    initiate
  };
};
