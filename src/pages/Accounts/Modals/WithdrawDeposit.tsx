import React, { FC, useEffect } from 'react';
import { Modal } from '@unique-nft/ui-kit';
import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { useWithdrawDepositStages } from '../../../hooks/accountStages/useWithdrawDepositStages';
import { useApi } from '../../../hooks/useApi';

export type WithdrawDepositStagesModalProps = {
  isVisible: boolean
  address?: string
  onFinish(): void
}

export const WithdrawDepositStagesModal: FC<WithdrawDepositStagesModalProps> = ({ isVisible, address, onFinish }) => {
  const { stages, status, initiate } = useWithdrawDepositStages(address || '');
  const { api } = useApi();

  useEffect(() => {
    if (!isVisible) return;
    initiate();
  }, [isVisible]);

  if (!isVisible || !api?.market) return null;

  return (<Modal isVisible={isVisible} isClosable={false}>
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  </Modal>);
};
