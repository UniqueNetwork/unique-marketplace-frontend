import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TTransfer } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { Address } from '@unique-nft/utils';
import { CollectionMode } from 'api/chainApi/types';

export const useTransferStages = (collectionId: number, tokenId: number, mode: CollectionMode) => {
  const { api, chainProperties } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TTransfer>[] = useMemo(() => [{
    title: 'Transfer in progress',
    description: '',
    status: StageStatus.default,
    action: (params) => {
      const sender = Address.is.ethereumAddress(params.txParams.sender)
        ? params.txParams.sender
        : Address.normalize.substrateAddress(params.txParams.sender, chainProperties?.SS58Prefix);
      return marketApi?.transferToken(
        sender,
        params.txParams?.recipient || '',
        collectionId,
        tokenId,
        mode,
        params.txParams.amount,
        params.options
      );
    }
  }], [marketApi, collectionId, tokenId, mode]);
  const { stages, error, status, initiate } = useStages<TTransfer>(transferStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
