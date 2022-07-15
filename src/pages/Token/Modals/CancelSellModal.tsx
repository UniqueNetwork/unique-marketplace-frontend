import React, { FC, useEffect } from 'react';
import { useNotifications } from '@unique-nft/ui-kit';

import { useCancelSellFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';

export const CancelSellFixStagesModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable, testid }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useCancelSellFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { info } = useNotifications();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    setIsClosable(false);
    void initiate({ accountAddress: selectedAccount?.address });
  }, [selectedAccount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}>Sale canceled</div>,
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
