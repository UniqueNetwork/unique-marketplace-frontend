import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TPurchaseProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const usePurchaseFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signPayloadJSON } = useAccounts();
  const marketApi = api?.market;
  const purchaseStages: InternalStage<TPurchaseProps>[] = useMemo(() => [{
    title: 'Place a deposit',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.addDeposit(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
  },
  {
    title: 'Buy NFT',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.buyToken(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
  },
  {
    title: 'Sending NFT to wallet',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.unlockNft(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
  }], [marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TPurchaseProps>(purchaseStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
