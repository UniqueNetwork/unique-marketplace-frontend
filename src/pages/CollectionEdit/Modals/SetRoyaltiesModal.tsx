import React, { FC, useEffect } from 'react';
import { useNotifications } from 'components/UI';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import StagesModal from 'pages/Token/Modals/StagesModal';
import { useSetRoyaltiesStages } from 'hooks/marketplaceStages/useSetRoyaltiesStages';
import { RoyaltiesFormData } from '../types';

type SetRoyaltiesStagesModalProps = {
  formData?: RoyaltiesFormData,
  collectionId: number
  onFinish(): void
}

export const SetRoyaltiesStagesModal: FC<SetRoyaltiesStagesModalProps> = ({
  formData,
  collectionId,
  onFinish
}) => {
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useSetRoyaltiesStages(collectionId);
  const { info } = useNotifications();

  useEffect(() => {
    if (!selectedAccount || !formData) throw new Error('Account not selected');
    void initiate({
      royalties: formData.royalties
    });
  }, [selectedAccount, formData]);

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
