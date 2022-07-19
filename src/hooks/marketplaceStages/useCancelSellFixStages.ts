import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TDelistProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useCancelSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const marketApi = api?.market;
  const delistStages: InternalStage<TDelistProps>[] = useMemo(() => [
    {
      title: 'Unlocking NFT',
      description: '',
      status: StageStatus.default,
      action: (params) => marketApi?.cancelSell(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
    },
    {
      title: 'Sending NFT to wallet',
      description: '',
      status: StageStatus.default,
      action: (params) => marketApi?.unlockNft(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
    }
  ], [marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TDelistProps>(delistStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
