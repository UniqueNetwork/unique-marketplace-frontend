import React, { FC, useEffect } from 'react';
import { useNotifications } from '@unique-nft/ui-kit';
import { useWithdrawBidStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { StageStatus } from '../../../types/StagesTypes';

export const WithdrawBidStagesModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, testid }) => {
  const { stages, status, initiate } = useWithdrawBidStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { info } = useNotifications();

  useEffect(() => { initiate(null); }, []);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}>Bid withdrawn</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={testid}
      />
    </div>
  );
};
