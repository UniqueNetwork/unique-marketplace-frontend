import { useApi } from '../useApi';
import useAccountStages, { AccountStage } from '../useAccountStages';
import { useCallback, useMemo } from 'react';
import { StageStatus } from '../../types/StagesTypes';

export type TWithdrawDeposit = {
  address: string
};

export const useWithdrawDepositStages = (address: string) => {
  const { api } = useApi();
  const marketApi = api?.market;
  const transferStages: AccountStage<TWithdrawDeposit>[] = useMemo(() => [{
    title: 'Withdraw deposit',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.withdrawDeposit(params.txParams.address, params.options)
  }], [marketApi]);

  const { stages, error, status, initiate: initiateStages } = useAccountStages<TWithdrawDeposit>(transferStages, address);

  const initiate = useCallback(() => {
    initiateStages({ address });
  }, [initiateStages, address]);

  return {
    stages,
    error,
    status,
    initiate
  };
};
