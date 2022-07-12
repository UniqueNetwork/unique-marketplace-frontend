import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Heading, Link, useNotifications } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TTransfer } from './types';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useTransferStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { TextInput } from 'components/TextInput/TextInput';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';

export const TransferModal: FC<TTokenPageModalBodyProps> = ({ token, setIsClosable, onFinish }) => {
  const { selectedAccount } = useAccounts();
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask'); // TODO: naming
  const [recipient, setRecipient] = useState<string>('');

  const onTransfer = useCallback((_recipient: string) => {
    setRecipient(_recipient);
    setStatus('transfer-stage');
    setIsClosable(false);
  }, [setStatus, setRecipient, setIsClosable]);

  if (!selectedAccount) return null;

  if (status === 'ask') return (<AskTransferModal onTransfer={onTransfer} />);
  if (status === 'transfer-stage') {
    return (<TransferStagesModal
      recipient={recipient}
      onFinish={onFinish}
      token={token}
      setIsClosable={setIsClosable}
      sender={selectedAccount.address}
    />);
  }
  return null;
};

const AskTransferModal: FC<{ onTransfer(receiver: string): void }> = ({ onTransfer }) => {
  const [address, setAddress] = useState<string>('');
  const onAddressInputChange = useCallback((value: string) => {
    setAddress(value);
  }, []);

  const onConfirmTransferClick = useCallback(
    () => {
      if (!address) return;
      onTransfer(address);
    },
    [address, onTransfer]
  );

  return (
    <>
      <Content>
        <Heading size='2'>Transfer NFT token</Heading>
      </Content>
      <InputWrapper
        label='Please enter the address you wish to send the NFT to'
        onChange={onAddressInputChange}
        value={address}
      />
      <WarningBlock>
        Proceed with caution, once confirmed the transaction cannot be reverted.
      </WarningBlock>
      <WarningBlock>
        Make sure to use a Substrate address created with a Polkadot.&#123;js&#125; wallet. There is no guarantee that third-party wallets, exchanges or hardware wallets can successfully sign and process your transfer which will result in a possible loss of the NFT.
      </WarningBlock>
      <ButtonWrapper>
        <Button
          disabled={!address}
          onClick={onConfirmTransferClick}
          role='primary'
          title='Confirm'
        />
      </ButtonWrapper>
    </>
  );
};

const TransferStagesModal: FC<TTokenPageModalBodyProps & TTransfer> = ({ token, onFinish, sender, recipient }) => {
  const { stages, status, initiate } = useTransferStages(token?.collectionId || 0, token?.id || 0);
  const { info } = useNotifications();

  useEffect(() => {
    initiate({ sender, recipient });
  }, [sender, recipient]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <><Link href={`/token/${token?.collectionId}/${token?.id}`} title={`${token?.prefix} #${token?.id}`}/> transferred</>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

const InputWrapper = styled(TextInput)`
  margin-bottom: 32px;
  width: 100%;

  label {
    margin-bottom: 16px;    
    white-space: break-spaces;
    height: auto;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;
