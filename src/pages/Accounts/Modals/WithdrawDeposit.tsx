import React, { FC, useEffect } from 'react';
import { Modal } from '@unique-nft/ui-kit';
import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { useWithdrawDepositStages } from '../../../hooks/accountStages/useWithdrawDepositStages';
import { useApi } from '../../../hooks/useApi';
import { useNotification } from '../../../hooks/useNotification';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';

export type WithdrawDepositStagesModalProps = {
  isVisible: boolean
  address?: string
  onFinish(): void
}

export const WithdrawDepositStagesModal: FC<WithdrawDepositStagesModalProps> = ({ isVisible, address, onFinish }) => {
  const { stages, status, initiate } = useWithdrawDepositStages(address || '');
  const { api } = useApi();
  const { push } = useNotification();

  useEffect(() => {
    if (!isVisible) return;
    initiate();
  }, [isVisible]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: 'Deposit withdrawn' });
    }
  }, [status]);

  if (!isVisible || !api?.market) return null;

  return (<Modal isVisible={isVisible} isClosable={false}>
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  </Modal>);
};
