import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TAuctionProps } from '../../pages/Token/Modals/types';
import { startAuction } from '../../api/restApi/auction/auction';
import { TTransaction } from '../../api/chainApi/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { fromStringToBnString } from '../../utils/bigNum';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const useAuctionSellStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const marketApi = api?.market;

  const sellAuctionStages: InternalStage<TAuctionProps>[] = useMemo(() => [
    {
      title: 'Starting auction',
      description: '',
      status: StageStatus.default,
      action: (params) =>
        marketApi?.transferToAuction(
          params.txParams.accountAddress,
          collectionId.toString(),
          tokenId.toString(),
          {
            ...params.options,
            send:
              (signedTx) => {
                const startPrice = fromStringToBnString(params.txParams.startingPrice.toString(), api?.market?.kusamaDecimals);
                const priceStep = fromStringToBnString(params.txParams.minimumStep.toString(), api?.market?.kusamaDecimals);
                return startAuction({ tx: signedTx, days: params.txParams.duration, startPrice, priceStep });
              }
            }
          )
    }
  ], [marketApi, api?.market?.kusamaDecimals, collectionId, tokenId]);

  const { stages, error, status, initiate } = useStages<TAuctionProps>(sellAuctionStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
