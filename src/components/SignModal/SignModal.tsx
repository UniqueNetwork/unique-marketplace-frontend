import React, { FC, useCallback, useState } from 'react';
import { Avatar, Button, Heading, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { KeyringPair } from '@polkadot/keyring/types';

import DefaultAvatar from '../../static/icons/default-avatar.svg';
import { Account, AccountSigner } from '../../account/AccountContext';
import { useAccounts } from '../../hooks/useAccounts';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import AccountCard from '../Account/Account';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';

export type TSignModalProps = {
  isVisible: boolean
  account?: Account
  onFinish(signature?: KeyringPair): void
  onClose(): void
}

export const SignModal: FC<TSignModalProps> = ({ account, isVisible, onFinish, onClose }) => {
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const { unlockLocalAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const onSignClick = useCallback(() => {
    if (!account || account.signerType !== AccountSigner.local) return;
    try {
      setPasswordError(undefined);
      const signature = unlockLocalAccount(password, account);
      if (signature) {
        onFinish(signature);
      }
    } catch (e) {
      setPasswordError('Unable to decode using the supplied passphrase');
    }

    setPassword('');
  }, [account, password]);

  if (!account) return null;

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>{'Authorize transaction'}</Heading>
    </Content>
    <AddressWrapper>
      <AccountCard
        accountName={account.meta.name || ''}
        accountAddress={account.address}
        isShort={deviceSize === DeviceSize.sm}
        canCopy={false}
      />
    </AddressWrapper>
    <CredentialsWrapper >
      <PasswordInput
        placeholder={'Password'}
        onChange={setPassword}
        value={password}
      />
      {passwordError && <Text color={'coral-500'} >{passwordError}</Text>}
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
  align-items: center;
  margin: calc(var(--gap) * 2) 0;
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
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
