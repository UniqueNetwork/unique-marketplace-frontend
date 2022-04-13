import React, { FC, useEffect } from 'react';
import { Link } from '@unique-nft/ui-kit';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { push } = useNotification();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    initiate({ accountAddress: selectedAccount.address });
  }, [selectedAccount?.address]);

  const { tokenId, collectionId } = offer || {};
  const { prefix } = offer?.tokenDescription || {};

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <>You are the new owner of <Link href={`/token/${collectionId || ''}/${tokenId || ''}`} title={`${prefix || ''} #${tokenId || ''}`}/></> });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export default PurchaseModal;
