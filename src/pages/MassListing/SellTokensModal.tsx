import React, { FC, useEffect, useState } from 'react';
import { Modal, useNotifications } from 'components/UI';
import { StageStatus } from 'types/StagesTypes';
import { TokenWithPrice } from './NFTLine';
import { useSellBulkStages } from './hooks/useSellBulkStages';
import DefaultMarketStages from 'pages/Token/Modals/StagesModal';

export type SellTokensModalProps = {
  isVisible: boolean;
  tokensForListing: TokenWithPrice[];
  onFinish(): void;
  testid: string;
};

export const SellTokensModal: FC<SellTokensModalProps> = ({ isVisible, tokensForListing, onFinish, testid }) => {
  const { stages, status, initiate } = useSellBulkStages(tokensForListing);
  const { info } = useNotifications();
  const [isInitiated, setIsInitiated] = useState(false);

  useEffect(() => {
    if (isVisible && !isInitiated) {
      initiate(null);
      setIsInitiated(true);
    }
  }, [isVisible, isInitiated]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info('Sell process completed successfully', {
        name: 'success',
        size: 32,
        color: 'var(--color-additional-light)',
      });
      onFinish();
    }
  }, [status]);

  return (
    <Modal isVisible={isVisible} isClosable={false}>
      <div>
        <DefaultMarketStages
          stages={stages}
          status={status}
          onFinish={onFinish}
          testid={`${testid}`}
        />
      </div>
    </Modal>
  );
};
