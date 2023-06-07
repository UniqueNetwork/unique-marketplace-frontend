import React, { FC, useEffect } from 'react';
import { Link } from '@unique-nft/ui-kit';
import { useNotifications } from 'components/UI';

import { usePurchaseFixStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { FeeMessage } from 'components';
import { useGetFee } from 'hooks/useGetFee';
import MarketController from 'api/chainApi/MarketController';
import { useApi } from 'hooks/useApi';
import { debounce } from 'utils/helpers';

const PurchaseModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable, testid }) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = usePurchaseFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { info } = useNotifications();

  const { fee, fetchingFee, getFee } = useGetFee<Parameters<MarketController['getBuyFixFee']>>(api?.market?.getBuyFixFee.bind(api?.market));

  useEffect(() => {
    if (!offer || !selectedAccount) return;
    debounce(async () => {
      await getFee(
        offer.collectionId,
        offer.tokenId,
        1,
        { account: selectedAccount }
      );
    }, 300)();
  }, [offer, selectedAccount]);

  useEffect(() => {
    if (!selectedAccount) throw new Error('Account not selected');
    setIsClosable(false);
    void initiate({ accountAddress: selectedAccount.address, amount: 1, price: offer?.price.parsed || 0 });
  }, [selectedAccount, offer]);

  const { tokenId, collectionId } = offer || {};
  const { tokenPrefix } = offer?.collectionDescription || {};

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}>You are the new owner of <Link href={`/token/${collectionId || ''}/${tokenId || ''}`} title={`${tokenPrefix || ''} #${tokenId || ''}`}/></div>,
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
      <FeeMessage
        isFeeLoading={fetchingFee}
        fee={fee || '0'}
        testid={`${testid}-fee-message`}
      />
    </div>
  );
};

export default PurchaseModal;
