import { useMemo } from 'react';
import { useApi } from '../useApi';
import useMarketplaceStages, { MarketplaceStage } from '../useMarketplaceStages';
import { TFixPriceProps } from '../../pages/Token/Modals/types';
import { StageStatus } from '../../types/StagesTypes';

export const useSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const sellFixStages: MarketplaceStage<TFixPriceProps>[] = useMemo(() => [{
    title: 'Register sponsorship',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.addToWhiteList(params.txParams.accountAddress, params.options)
  },
  {
    title: 'Prepare NFT to be sent to smart contract',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.lockNftForSale(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params.options)
  },
  {
    title: 'Allow smart contract to receive an NFT',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.sendNftToSmartContract(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params.options)
  },
  {
    title: 'Set the NFT price',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.setForFixPriceSale(params.txParams.accountAddress, params.collectionId.toString(), params.tokenId.toString(), params?.txParams?.price.toString() || '-1', params.options)
  }], [marketApi]);
  const { stages, error, status, initiate } = useMarketplaceStages<TFixPriceProps>(collectionId, tokenId, sellFixStages);

  return {
    stages,
    error,
    status,
    initiate
  };
};
