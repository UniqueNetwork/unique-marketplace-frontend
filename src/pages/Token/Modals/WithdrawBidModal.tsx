import React, { FC, useEffect } from 'react';
import { useWithdrawBidStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';
import { useAccounts } from '../../../hooks/useAccounts';

export const WithdrawBidStagesModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish }) => {
  const { stages, status, initiate } = useWithdrawBidStages(offer?.collectionId || 0, offer?.tokenId || 0);
  useEffect(() => { initiate(null); }, []);
  const { push } = useNotification();
  const { updateAccountBalance } = useAccounts();

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <>Bid withdrawn</> });
      void updateAccountBalance();
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
