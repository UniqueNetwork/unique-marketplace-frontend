import { useMemo } from 'react';
import { useApi } from '../useApi';
import { placeBidRequest } from '../../api/restApi/auction/auction';
import { TAuctionBidProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useAuctionBidStages = (collectionId: number, tokenId: number) => {
  const { api, currentChainId = 'unique' } = useApi();
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
          { ...params.options, send: (signedTx) => placeBidRequest({ tx: signedTx, collectionId, tokenId, network: currentChainId }) })
    }
  ], [marketApi, collectionId, tokenId, currentChainId]);

  const { stages, error, status, initiate } = useStages<TAuctionBidProps>(bidAuctionStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
