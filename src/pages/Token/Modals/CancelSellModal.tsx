import { FC, useEffect } from 'react';
import { useCancelSellFixStages } from '../../../hooks/useMarketplaceStages';
import DefaultMarketStages from './StagesModal';

export const CancelSellFixStagesModal: FC<any> = ({ collectionId, tokenId, onModalClose }) => {
  const { stages, status, initiate } = useCancelSellFixStages(collectionId, tokenId);
  useEffect(() => { initiate(null); }, []);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onModalClose={onModalClose} />
    </div>
  );
};
