import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TCreateAccountModalProps } from './types';
import { PasswordInput } from '../../../components/PasswordInput/PasswordInput';
import { QRReader, ScannedResult } from '../../../components/QRReader/QRReader';
import { useAccounts } from '../../../hooks/useAccounts';

export const ImportViaQRCodeAccountModal: FC<TCreateAccountModalProps> = ({ isVisible, onFinish }) => {
  const [scanned, setScanned] = useState<ScannedResult>();
  const [password, setPassword] = useState<string>('');
  const { addAccountViaQR } = useAccounts();

  const onScan = useCallback((scanned: ScannedResult) => {
    setScanned(scanned);
  }, []);

  const onSaveClick = useCallback(() => {
    if (!scanned) return;

    const { name, isAddress, content, genesisHash } = scanned;

    addAccountViaQR({
      name: name || 'unnamed',
      isAddress,
      content,
      genesisHash,
      password
    });
  }, [scanned, password]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onFinish}>
    <Content>
      <Heading size='2'>{'Add an account via QR-code'}</Heading>
    </Content>
    <InputWrapper>
      <Text size={'m'}>Provide the account QR from the module/external application for scanning. Once detected as valid, you will be taken to the next step to add the account to your list.</Text>
      <QRReader onScan={onScan} />
    </InputWrapper>
    <InputWrapper>
      <Text size={'m'}>Password</Text>
      <Text size={'s'} color={'grey-500'}>The password that was previously used to encrypt this account</Text>
      <PasswordInput placeholder={'Password'}
        onChange={setPassword}
        value={password}
      />
    </InputWrapper>

    <ButtonWrapper>
      <Button
        // disabled={!address || !confirmSeedSaved}
        onClick={onSaveClick}
        role='primary'
        title='Save'
      />
    </ButtonWrapper>

  </Modal>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const InputWrapper = styled.div`
  padding: var(--gap) 0;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--gap);
  row-gap: var(--gap);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
