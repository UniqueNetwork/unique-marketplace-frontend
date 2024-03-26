import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TDelistProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useBurnStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const nftApi = api?.nft;
  const delistStages: InternalStage<TDelistProps>[] = useMemo(() => [
    {
      title: 'Burning',
      description: '',
      status: StageStatus.default,
      action: ({ options }) => {
        return nftApi?.burn({ collectionId, tokenId }, { account: options.account });
      }
    }
  ], [nftApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TDelistProps>(delistStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
