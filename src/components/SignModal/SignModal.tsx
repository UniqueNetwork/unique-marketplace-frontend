import React, { FC, useCallback, useState } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Button, Text, Modal } from 'components/UI';

import { PasswordInput } from '../PasswordInput/PasswordInput';
import AccountCard from '../Account/Account';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';
import { KeyringPair } from '@polkadot/keyring/types';

const testid = 'sign-modal';

export type TSignModalProps = {
  isVisible: boolean
  keyringPair?: KeyringPair
  onFinish(password?: string): void
  onClose(): void
}

export const SignModal: FC<TSignModalProps> = ({ keyringPair, isVisible, onFinish, onClose }) => {
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const deviceSize = useDeviceSize();

  const onSignClick = useCallback(() => {
    if (!keyringPair) return;
    try {
      setPasswordError(undefined);
      // const signature = unlockLocalAccount(password, account);

      keyringPair.unlock(password);
      onFinish(password);
    } catch (e) {
      setPasswordError('Unable to decode using the supplied passphrase');
    }

    setPassword('');
  }, [keyringPair, password]);

  if (!keyringPair) return null;

  return (<Modal isVisible={isVisible}
    isClosable={true}
    onClose={onClose}
    isGlobalBackdrop
  >
    <Content>
      <Heading size='2'>{'Authorize transaction'}</Heading>
    </Content>
    <AddressWrapper>
      <AccountCard
        accountName={keyringPair?.meta?.name as string || ''}
        accountAddress={keyringPair.address}
        isShort={deviceSize === DeviceSize.sm}
        canCopy={false}
      />
    </AddressWrapper>
    <CredentialsWrapper >
      <PasswordInput
        placeholder={'Password'}
        onChange={setPassword}
        value={password}
        testid={`${testid}-password`}
      />
      {passwordError && <Text color={'coral-500'} >{passwordError}</Text>}
    </CredentialsWrapper>
    <ButtonWrapper>
      <Button
        testid={`${testid}-sign-button`}
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
