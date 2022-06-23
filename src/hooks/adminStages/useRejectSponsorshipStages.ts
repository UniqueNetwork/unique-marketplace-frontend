import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useRejectSponsorshipStages = (collectionId: number) => {
  const { api } = useApi();
  const { signTx } = useAccounts();
  const marketApi = api?.market;
  const rejectSponsorshipStages: InternalStage<null>[] = useMemo(() => [{
    title: 'Cancelling sponsorship',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.removeCollectionSponsor(collectionId, params.options)
  }], [marketApi]);

  const { stages, error, status, initiate } = useStages<null>(rejectSponsorshipStages, signTx);

  return {
    stages,
    error,
    status,
    initiate
  };
};
