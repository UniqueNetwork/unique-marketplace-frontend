import React, { FC, useEffect } from 'react';
import { useNotifications } from 'components/UI';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import StagesModal from 'pages/Token/Modals/StagesModal';
import { useUpdateCollectionMetadataStages } from 'hooks/marketplaceStages/useUpdateCollectionMetadata';
import { MarketableCollectionMetadata } from 'api/restApi/collections/types';

type SaveCollectionStagesModalProps = {
  metadata: MarketableCollectionMetadata,
  coverFile?: Blob
  bannerFile?: Blob
  collectionId: number
  onFinish(): void
}

export const SaveCollectionStagesModal: FC<SaveCollectionStagesModalProps> = ({
  metadata,
  coverFile,
  bannerFile,
  collectionId,
  onFinish
}) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useUpdateCollectionMetadataStages(collectionId);
  const { info } = useNotifications();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    void initiate({
      metadata,
      coverFile,
      bannerFile
    });
  }, [selectedAccount, metadata, coverFile, bannerFile]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div>Collection saved</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <StagesModal
        stages={stages}
        status={status}
        onFinish={onFinish}
      />
    </div>
  );
};
