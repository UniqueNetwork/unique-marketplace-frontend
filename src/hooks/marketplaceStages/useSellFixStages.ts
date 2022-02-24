import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages from '../useMarketplaceStages';
import { InternalStage, MarketType, StageStatus, TInternalStageActionParams } from '../../types/MarketTypes';
import { TFixPriceProps } from '../../pages/Token/Modals/types';

export const useSellFixStages = (collectionId: string, tokenId: string) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const sellFixStages = useMemo(() => [{
    title: 'Add to WhiteList',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.addToWhiteList(params.account, params.options)
  },
  {
    title: 'Locking NFT for sale',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.lockNftForSale(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Sending NFT to Smart contract',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.sendNftToSmartContract(params.account, params.collectionId, params.tokenId.toString(), params.options)
  },
  {
    title: 'Setting price',
    description: '',
    status: StageStatus.default,
    action: (params: TInternalStageActionParams<TFixPriceProps>) => marketApi?.setForFixPriceSale(params.account, params.collectionId, params.tokenId.toString(), params?.txParams?.price || -1, params.options)
  }], [marketApi]) as InternalStage<TFixPriceProps>[];
  const { stages, error, status, initiate } = useMarketplaceStages<TFixPriceProps>(MarketType.sellFix, collectionId, tokenId, sellFixStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
