import React, { FC, useEffect } from 'react';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(token?.collectionId || 0, token?.id);
  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    initiate({ accountAddress: selectedAccount.address });
  }, [selectedAccount?.address]);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export default PurchaseModal;
