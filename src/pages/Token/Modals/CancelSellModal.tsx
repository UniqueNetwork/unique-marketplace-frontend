import { FC, useEffect } from 'react';
import { useCancelSellFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';

export const CancelSellFixStagesModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish }) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useCancelSellFixStages(token.collectionId || 0, token.id);
  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    initiate({ accountAddress: selectedAccount?.address });
  }, [selectedAccount]);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
