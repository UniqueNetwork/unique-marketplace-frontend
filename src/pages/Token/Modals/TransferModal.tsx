import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Heading, InputText, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TTransfer } from './types';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { AdditionalWarning100 } from '../../../styles/colors';
import { useTransferStages } from '../../../hooks/marketplaceStages';
import DefaultMarketStages from './StagesModal';

export const TransferModal: FC<TTokenPageModalBodyProps> = ({ token, setIsClosable, onFinish }) => {
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask'); // TODO: naming
  const [recipient, setRecipient] = useState<string>('');

  const onTransfer = useCallback((_recipient: string) => {
    setRecipient(_recipient);
    setStatus('transfer-stage');
    setIsClosable(false);
  }, [setStatus, setRecipient]);

  if (status === 'ask') return (<AskTransferModal onTransfer={onTransfer} />);
  if (status === 'transfer-stage') {
    return (<TransferStagesModal
      recipient={recipient}
      onFinish={onFinish}
      token={token}
      setIsClosable={setIsClosable}
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
      onTransfer(address);
    },
    [address]
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
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        Proceed with caution, once confirmed the transaction cannot be reverted.
      </TextStyled>
      <Text color='grey-500' size='m'>
        {'Make sure to use a Substrate address created with a Polkadot.{js} wallet. There is no guarantee that third-party wallets, exchanges or hardware wallets can successfully sign and process your transfer which will result in a possible loss of the NFT.'}
      </Text>
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

const TransferStagesModal: FC<TTokenPageModalBodyProps & TTransfer> = ({ token, onFinish, recipient }) => {
  const { stages, status, initiate } = useTransferStages(token?.collectionId || 0, token?.id);
  useEffect(() => { initiate({ recipient }); }, [recipient]);
  return (
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  );
};

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const InputWrapper = styled(InputText)`
  margin-bottom: 32px;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;
