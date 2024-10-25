import React, { FC, useEffect } from 'react';
import { Link, useNotifications } from 'components/UI';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { useApi } from 'hooks/useApi';
import { debounce } from 'utils/helpers';
import { NavLink } from 'react-router-dom';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable, testid }) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(offer?.collectionId || 0, offer?.tokenId || 0, offer?.price.currency || 0, offer?.contractAddress);
  const { info } = useNotifications();

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    setIsClosable(false);
    void initiate({ accountAddress: selectedAccount.address, amount: 1, price: Number(offer?.price.raw) || 0, currency: offer?.price.currency || 0 });
  }, [selectedAccount, offer]);

  const { tokenId, collectionId } = offer || {};
  const { tokenPrefix } = offer?.collectionDescription || {};

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}>
          You are the new owner of{' '}
          <NavLink to={`/token/${collectionId}/${tokenId}`}>
            {tokenPrefix} #{tokenId}
          </NavLink>{' '}
        </div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={testid}
      />
    </div>
  );
};

export default PurchaseModal;
