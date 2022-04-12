import React, { FC, useEffect, useMemo } from 'react';
import { Link } from '@unique-nft/ui-kit';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish }) => {
  const { selectedAccount, updateAccountBalance } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { push } = useNotification();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    initiate({ accountAddress: selectedAccount.address });
  }, [selectedAccount?.address]);

  const prefix = useMemo(() => {
    return offer?.tokenDescription.find(({ key }) => key === 'prefix')?.value || '';
  }, [offer]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: <>You are the new owner of <Link href={`/token/${offer?.collectionId}/${offer?.tokenId}`} title={`${prefix} #${offer?.tokenId}`}/></> });
      void updateAccountBalance();
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export default PurchaseModal;
