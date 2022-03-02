import { FC, useEffect } from 'react';
import { useWithdrawBidStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';

export const WithdrawBidStagesModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish, setIsClosable }) => {
  const { stages, status, initiate } = useWithdrawBidStages(token.collectionId || 0, token.id);
  useEffect(() => { initiate(null); }, []);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
