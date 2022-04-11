import React, { FC, useEffect } from 'react';
import { useCancelAuctionStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

export const CancelAuctionStagesModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish, setIsClosable }) => {
  const { stages, status, initiate } = useCancelAuctionStages(token.collectionId || 0, token.id);
  useEffect(() => {
    setIsClosable(false);
    initiate(null);
  }, []);
  const { push } = useNotification();

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: 'Auction cancelled' });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
