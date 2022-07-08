import React, { FC, useEffect } from 'react';
import { Link, useNotifications } from '@unique-nft/ui-kit';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { info } = useNotifications();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    setIsClosable(false);
    initiate({ accountAddress: selectedAccount.address });
  }, [selectedAccount?.address]);

  const { tokenId, collectionId } = offer || {};
  const { prefix } = offer?.tokenDescription || {};

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <>You are the new owner of <Link href={`/token/${collectionId || ''}/${tokenId || ''}`} title={`${prefix || ''} #${tokenId || ''}`}/></>,
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

export default PurchaseModal;
