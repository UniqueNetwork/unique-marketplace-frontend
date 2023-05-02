import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TTransferFunds } from '../../pages/Accounts/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';
import { BN } from '@polkadot/util';

export const useTransferFundsStages = (accountAddress: string) => {
  const { api } = useApi();
  const { accounts } = useAccounts();
  const marketApi = api?.market;
  const transferStages: InternalStage<TTransferFunds>[] = useMemo(() => [{
    title: 'Transfer funds',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.transferBalance(params.txParams.sender, params.txParams?.recipient || '', new BN(params.txParams?.amount), params.options)
  }], [marketApi]) as InternalStage<TTransferFunds>[];

  const signer = useMemo(() => {
    return accounts.find(({ address }) => address === accountAddress);
  }, [accounts, accountAddress]);

  const { stages, error, status, initiate } = useStages<TTransferFunds>(transferStages, signer);

  return {
    stages,
    error,
    status,
    initiate
  };
};
