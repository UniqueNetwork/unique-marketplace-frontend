import React, { FC, useEffect } from 'react';
import { useNotifications } from 'components/UI';

import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { useBurnStages } from 'hooks/marketplaceStages/useBurnStages';
import { useNavigate } from 'react-router-dom';
import { useApi } from 'hooks/useApi';

export const BurnStagesModal: FC<TTokenPageModalBodyProps> = ({ token, setIsClosable, testid }) => {
  const { selectedAccount } = useAccounts();
  const { currentChainId } = useApi();
  const { collectionId, tokenId } = token!;
  const { stages, status, initiate } = useBurnStages(collectionId, tokenId);
  const { info } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    setIsClosable(false);
    void initiate({ accountAddress: selectedAccount.address });
  }, [selectedAccount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}>Burn</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  const onFinish = () => {
    navigate(`/${currentChainId}/sellTokens?filterState=`);
  };

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
