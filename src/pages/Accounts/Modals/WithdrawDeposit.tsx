import React, { FC, useEffect } from 'react';
import { Modal, useNotifications } from 'components/UI';

import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { StageStatus } from 'types/StagesTypes';
import { useWithdrawStages } from 'hooks/accountStages/useWithdrawStages';
import { Address } from '@unique-nft/utils';

export type WithdrawDepositModalProps = {
  isVisible: boolean
  address?: string
  onFinish(): void
  testid: string
}

export const WithdrawDepositModal: FC<WithdrawDepositModalProps> = ({ isVisible, address, onFinish, testid }) => {
  if (isVisible && address) {
    return <WithdrawDepositStagesModal address={address}
      onFinish={onFinish}
      testid={testid}
      isVisible={isVisible}
    />;
  }
  return <></>;
};

export const WithdrawDepositStagesModal: FC<WithdrawDepositModalProps> = ({ address, onFinish, testid }) => {
  const { stages, status, initiate } = useWithdrawStages(address || '');
  const { info } = useNotifications();
  useEffect(() => {
    if (!address) throw new Error('Failed to provide address');
    const sender = Address.is.substrateAddress(address) ? Address.mirror.substrateToEthereum(address) : Address.mirror.ethereumToSubstrate(address);
    void initiate({ sender, recipient: address });
  }, [address]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        'Withdraw completed',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
      onFinish();
    }
  }, [info, status, onFinish]);

  return (<Modal isVisible={true} isClosable={false}>
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={`${testid}`}
      />
    </div>
  </Modal>);
};
