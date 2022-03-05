import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { TCreateAccountBodyModalProps } from './types';
import { Avatar, Button, InputText, Text } from '@unique-nft/ui-kit';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import styled from 'styled-components/macro';
import { AdditionalWarning100, Grey500 } from '../../../styles/colors';
import { PasswordInput } from '../../../components/PasswordInput/PasswordInput';

export const AskCredentialsModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish, onGoBack }) => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const onAccountNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const validPassword = useMemo(() => password === confirmPassword, [password, confirmPassword]);

  const onNextClick = useCallback(() => {
    if (!accountProperties) return;
    onFinish({ ...accountProperties, name, password });
  }, [name, password]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} />
      <Text>{accountProperties?.address || ''}</Text>
    </AddressWrapper>
    <CredentialsWrapper >
      <InputText placeholder={'New account name'} onChange={onAccountNameChange} value={name} />
      <PasswordInput placeholder={'Password'}
        onChange={setPassword}
        value={password}
      />
      <PasswordInput placeholder={'Confirm password'}
        onChange={setConfirmPassword}
        value={confirmPassword}
      />
    </CredentialsWrapper>
    <TextStyled
      color='additional-warning-500'
      size='s'
    >
      Consider storing your account in a signer such as a browser extension, hardware device, QR-capable phone wallet (non-connected) or desktop application for optimal account security. Future versions of the web-only interface will drop support for non-external accounts, much like the IPFS version.
    </TextStyled>
    <ButtonWrapper>
      <Button
        onClick={onGoBack}
        title='Previous'
      />
      <Button
        disabled={!validPassword || !password || !name}
        onClick={onNextClick}
        role='primary'
        title='Next'
      />
    </ButtonWrapper>
  </>);
};

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin: calc(var(--gap) * 2) 0;
`;

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: calc(var(--gap) * 1.5) 0;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--gap);
`;

const CredentialsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 1.5);
  .unique-input-text {
    width: 100%;
  }
`;
