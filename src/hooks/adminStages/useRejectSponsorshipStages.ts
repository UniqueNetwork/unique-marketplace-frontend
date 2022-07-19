import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useRejectSponsorshipStages = (collectionId: number) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const collectionApi = api?.collection;
  const rejectSponsorshipStages: InternalStage<null>[] = useMemo(() => [{
    title: 'Cancelling sponsorship',
    description: '',
    status: StageStatus.default,
    action: (params) => collectionApi?.removeCollectionSponsor(collectionId, params.options)
  }], [collectionApi]);

  const { stages, error, status, initiate } = useStages<null>(rejectSponsorshipStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
