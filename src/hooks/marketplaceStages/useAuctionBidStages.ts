import { useMemo } from 'react';
import { useApi } from '../useApi';
import { placeBid } from '../../api/restApi/auction/auction';
import { TAuctionBidProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useAuctionBidStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const marketApi = api?.market;
  const bidAuctionStages: InternalStage<TAuctionBidProps>[] = useMemo(() => [
    {
      title: 'Registering bid',
      description: '',
      status: StageStatus.default,
      action: (params) =>
        marketApi?.transferBidBalance(
          params.txParams.accountAddress,
          params.txParams.value,
          { ...params.options, send: (signedTx) => placeBid({ tx: signedTx, collectionId, tokenId }) })
    }
  ], [marketApi, collectionId, tokenId]);

  const { stages, error, status, initiate } = useStages<TAuctionBidProps>(bidAuctionStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
