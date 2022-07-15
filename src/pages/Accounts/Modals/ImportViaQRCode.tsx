import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Modal, Text } from '@unique-nft/ui-kit';
import keyring from '@polkadot/ui-keyring';
import styled from 'styled-components';

import { TAccountModalProps } from './types';
import { PasswordInput } from '../../../components/PasswordInput/PasswordInput';
import { QRReader, ScannedResult } from '../../../components/QRReader/QRReader';
import { useAccounts } from '../../../hooks/useAccounts';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { Avatar } from '../../../components/Avatar/Avatar';

export const ImportViaQRCodeAccountModal: FC<TAccountModalProps> = ({ isVisible, onFinish, testid }) => {
  const [address, setAddress] = useState<string>();
  const [scanned, setScanned] = useState<ScannedResult>();
  const [password, setPassword] = useState<string>('');
  const { addAccountViaQR } = useAccounts();

  const onScan = useCallback((scanned: ScannedResult) => {
    setScanned(scanned);

    setAddress(scanned.isAddress
      ? scanned.content
      : keyring.createFromUri(scanned.content, {}, 'sr25519').address);
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
    onFinish();
  }, [scanned, password, onFinish]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onFinish}>
    <Content>
      <Heading size='2'>{'Add an account via QR-code'}</Heading>
    </Content>
    <InputWrapper>
      <Text size={'m'}>Provide the account QR from the module/external application for scanning. Once detected as valid, you will be taken to the next step to add the account to your list.</Text>
      {!address && <QRReader onScan={onScan} />}
      {address && <AddressWrapper>
        <Avatar size={24} src={DefaultAvatar} address={address} />
        <Text
          // @ts-ignore
          testid={`${testid}-address`}
        >{address}</Text>
      </AddressWrapper>}
    </InputWrapper>
    <InputWrapper>
      <PasswordTitle>
        <Text size={'m'}>Password</Text>
        <Text size={'s'} color={'grey-500'}>The password that was previously used to encrypt this account</Text>
      </PasswordTitle>
      <PasswordInput
        testid={`${testid}-password`}
        onChange={setPassword}
        value={password}
      />
    </InputWrapper>

    <ButtonWrapper>
      <Button
        // @ts-ignore
        testid={`${testid}-save-button`}
        disabled={!address || !password}
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

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin: calc(var(--gap) * 2) 0;
`;

const InputWrapper = styled.div`
  padding: var(--gap) 0;
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: var(--gap);
`;

const PasswordTitle = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
`;
