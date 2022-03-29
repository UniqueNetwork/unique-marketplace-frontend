import React, { FC, useEffect } from 'react';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';
import { Link } from '@unique-nft/ui-kit';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(token?.collectionId || 0, token?.id);
  const { push } = useNotification();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    initiate({ accountAddress: selectedAccount.address });
  }, [selectedAccount?.address]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <>You are the new owner of <Link href={`/token/${token.collectionId}/${token.id}`} title={`${token.prefix} #${token.id}`}/></> });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export default PurchaseModal;
