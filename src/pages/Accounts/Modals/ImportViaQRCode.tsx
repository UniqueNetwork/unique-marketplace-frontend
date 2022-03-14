import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Scanned, TCreateAccountModalProps } from './types';
import keyring from '@polkadot/ui-keyring';
import { PasswordInput } from '../../../components/PasswordInput/PasswordInput';
import { QRReader } from '../../../components/QRReader';

export const ImportViaQRCodeAccountModal: FC<TCreateAccountModalProps> = ({ isVisible, onFinish }) => {
  const [name, setName] = useState<string>();
  const [address, setAddress] = useState<string>();
  const [password, setPassword] = useState<string>('');

  const onScan = useCallback((scanned: Scanned) => {
    setName(scanned.name);
    setAddress(scanned.isAddress ? scanned.content : keyring.createFromUri(scanned.content, {}, 'sr25519').address);
  }, []);

  const onSaveClick = useCallback(() => {
    if (!address) return;
  }, []);

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
