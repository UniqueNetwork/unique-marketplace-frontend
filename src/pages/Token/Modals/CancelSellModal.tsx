import { FC, useEffect } from 'react';
import { useCancelSellFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

export const CancelSellFixStagesModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useCancelSellFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { push } = useNotification();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    setIsClosable(false);
    void initiate({ accountAddress: selectedAccount?.address });
  }, [selectedAccount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: 'Sale canceled' });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
