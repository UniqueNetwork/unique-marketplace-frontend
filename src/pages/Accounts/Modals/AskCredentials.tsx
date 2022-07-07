import React, { FC, useCallback, useMemo, useState } from 'react';
import { TCreateAccountBodyModalProps } from './types';
import { Button, Text } from '@unique-nft/ui-kit';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import styled from 'styled-components';
import { PasswordInput } from '../../../components/PasswordInput/PasswordInput';
import { Avatar } from '../../../components/Avatar/Avatar';
import { TextInput } from '../../../components/TextInput/TextInput';

export const AskCredentialsModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish, onGoBack }) => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const onAccountNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const nameIsValid = useMemo(() => name.length > 2, [name]);
  const passwordIsValid = useMemo(() => password.length > 4, [password]);
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);

  const onNextClick = useCallback(() => {
    if (!accountProperties) return;
    onFinish({ ...accountProperties, name, password });
  }, [name, password]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} address={accountProperties?.address} />
      <Text color={'grey-500'}>{accountProperties?.address || ''}</Text>
    </AddressWrapper>
    <CredentialsWrapper>
      <Text size={'m'}>Name</Text>
      <Text size={'s'} color={'grey-500'}>Give your account a name for easier identification and handling. </Text>
      <TextInput onChange={onAccountNameChange} value={name} errorText={!nameIsValid && name ? 'Name must be 3 characters or more' : undefined} />

      <Text size={'m'}>Password</Text>
      <Text size={'s'} color={'grey-500'}>This is necessary to authenticate all committed transactions and encrypt the key pair.<br/> Ensure you are using a strong password for proper account protection. </Text>
      <PasswordInput
        onChange={setPassword}
        value={password}
      />
      <Text size={'m'}>Repeat password</Text>
      <PasswordInput
        onChange={setConfirmPassword}
        value={confirmPassword}
      />
      {!passwordIsValid && password && <Text size={'s'} color={'coral-500'}>Password must be 5 characters or more</Text>}
      {!passwordsMatch && confirmPassword && <Text size={'s'} color={'coral-500'}>Passwords do not match</Text>}
    </CredentialsWrapper>
    <ButtonWrapper>
      <StepsTextStyled size={'m'}>Step 2/3</StepsTextStyled>
      <Button
        onClick={onGoBack}
        title='Previous'
      />
      <Button
        disabled={!passwordsMatch || !passwordIsValid || !nameIsValid}
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
  margin-top: calc(var(--gap) * 1.5);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: 20px var(--gap);
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const StepsTextStyled = styled(Text)`
  flex-grow: 1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--gap);
  align-items: center;
`;

const CredentialsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 2);
  .unique-text.size-m {
    margin-top: calc(var(--gap) * 1.5);
  }
  .unique-input-text {
    width: 100%;
  }
`;
