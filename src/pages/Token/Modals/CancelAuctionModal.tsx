import React, { FC, useEffect } from 'react';
import { useNotifications } from '@unique-nft/ui-kit';

import { useCancelAuctionStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { StageStatus } from '../../../types/StagesTypes';

export const CancelAuctionStagesModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable }) => {
  const { stages, status, initiate } = useCancelAuctionStages(offer?.collectionId || 0, offer?.tokenId || 0);
  useEffect(() => {
    setIsClosable(false);
    initiate(null);
  }, []);
  const { info } = useNotifications();

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        'Auction cancelled',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
