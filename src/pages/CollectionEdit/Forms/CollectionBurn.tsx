import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, useNotifications } from 'components/UI';
import { ConfirmUpdateCollectionModal } from './ConfirmUpdateCollectionModal';
import { useCollectionBurn } from './hooks/useCollectionBurn';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { StatusTransactionModal } from './StatusTransactionModal';

type Props = {
  canBurn: boolean;
  collectionId?: number;
  collectionName?: string;
  onComplete?(): Promise<void>;
};

export const CollectionBurn = ({
  canBurn,
  collectionId,
  collectionName,
  onComplete
}: Props) => {
  const [isVisibleConfirmModal, setVisibleConfirmModal] = useState(false);
  const { selectedAccount } = useAccounts();
  const { currentChainId } = useApi();

  const {
    feeFormatted,
    getFee,
    feeError,
    feeLoading,
    submitWaitResult,
    isLoadingSubmitResult
  } = useCollectionBurn();
  const navigate = useNavigate();
  const { error, info } = useNotifications();
  useEffect(() => {
    if (feeError) {
      error(feeError);
    }
  }, [feeError]);

  useEffect(() => {
    if (!isVisibleConfirmModal || !collectionId || !selectedAccount?.address) {
      return;
    }
    getFee({ payload: collectionId });
  }, [collectionId, getFee, isVisibleConfirmModal, selectedAccount?.address]);

  const handleBurnCollection = async () => {
    if (!collectionId || !selectedAccount) {
      return;
    }

    setVisibleConfirmModal(false);

    try {
      await submitWaitResult({ payload: collectionId });
      await onComplete?.();
      info('The collection burned successfully');
      navigate(`/${currentChainId}/collections`);
    } catch (e: any) {
      setVisibleConfirmModal(false);
    }
  };

  if (!collectionId) {
    return null;
  }

  return (
    <>
      <Button
        title='Burn collection'
        disabled={!canBurn}
        iconLeft={{
          size: 15,
          name: 'burn',
          color: 'var(--color-coral-500)'
        }}
        role='danger'
        onClick={() => setVisibleConfirmModal(true)}
      />
      <StatusTransactionModal
        isVisible={isLoadingSubmitResult}
        description='Burning collection'
      />

      <ConfirmUpdateCollectionModal
        title={`Burn collection ${collectionName} [id: ${collectionId}]`}
        warning='You will not be able to undo this action.'
        isVisible={isVisibleConfirmModal}
        isLoading={feeLoading}
        fee={feeFormatted}
        onConfirm={handleBurnCollection}
        onClose={() => setVisibleConfirmModal(false)}
      />
    </>
  );
};
