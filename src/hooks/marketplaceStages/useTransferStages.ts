import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TTransfer } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';

export const useTransferStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TTransfer>[] = useMemo(() => [{
    title: 'Transfer in progress',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.transferToken(params.txParams.sender, params.txParams?.recipient || '', collectionId.toString(), tokenId.toString(), params.options)
  }], [marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TTransfer>(transferStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
