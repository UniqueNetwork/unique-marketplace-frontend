import React, { FC, useEffect } from 'react';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish }) => {
  const { stages, status, initiate } = usePurchaseFixStages(token?.collectionId || 0, token?.id);
  useEffect(() => { initiate(null); }, []);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

export default PurchaseModal;
