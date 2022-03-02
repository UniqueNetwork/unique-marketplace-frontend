import { FC, useEffect } from 'react';
import { useCancelAuctionStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';

export const CancelAuctionStagesModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish, setIsClosable }) => {
  const { stages, status, initiate } = useCancelAuctionStages(token.collectionId || 0, token.id);
  useEffect(() => { initiate(null); }, []);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};
