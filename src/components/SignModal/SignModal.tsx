import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { Avatar, Button, Heading, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { KeyringPair } from '@polkadot/keyring/types';

import DefaultAvatar from '../../static/icons/default-avatar.svg';
import { AdditionalWarning100, Grey500 } from '../../styles/colors';
import { AccountSigner } from '../../account/AccountContext';
import { useAccounts } from '../../hooks/useAccounts';

export type TSignModalProps = {
  isVisible: boolean
  onFinish(signature?: KeyringPair): void
  onClose(): void
}

export const SignModal: FC<TSignModalProps> = ({ isVisible, onFinish, onClose }) => {
  const [password, setPassword] = useState<string>('');
  const { selectedAccount, signLocalAccount } = useAccounts();

  const onPasswordChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    setPassword(target.value);
  }, []);

  const onSignClick = useCallback(() => {
    if (!selectedAccount || selectedAccount.signerType !== AccountSigner.local) return;
    const signature = signLocalAccount(password);
    if (signature) {
      onFinish(signature);
    }
    setPassword('');
  }, [selectedAccount, password]);

  if (!selectedAccount) return null;

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>{'Authorize transaction'}</Heading>
    </Content>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} />
      <Text>{selectedAccount.address || ''}</Text>
    </AddressWrapper>
    <CredentialsWrapper >
      <PasswordInput placeholder={'Password'}
        onChange={onPasswordChange}
        value={password}
        type='password'
      />
    </CredentialsWrapper>
    <ButtonWrapper>
      <Button
        disabled={!password}
        onClick={onSignClick}
        role='primary'
        title='Sign'
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

const PasswordInput = styled.input`
  border: 1px solid #d2d3d6;
  padding: 11px 12px;
  border-radius: 4px;
  &::placeholder {
    color: ${Grey500};
  }
`;
