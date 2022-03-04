import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Checkbox, Heading, InputText, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { AdditionalWarning100, Grey500 } from '../../../styles/colors';
import { TCreateAccountModalProps, CreateAccountModalStages, TAccountProperties, TCreateAccountBodyModalProps } from './types';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { addressFromSeed } from '../../../utils/seedUtils';
import { useAccounts } from '../../../hooks/useAccounts';

const derivePath = '';

const defaultPairType = 'sr25519';

const AskSeedPhraseModal: FC<TCreateAccountBodyModalProps> = ({ onFinish }) => {
  const [seed, setSeed] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [confirmSeedSaved, setConfirmSeedSaved] = useState<boolean>(false);

  const changeSeed = useCallback((value: string) => {
    setSeed(value);
    const newAddress = addressFromSeed(value, derivePath, defaultPairType);
    setAddress(newAddress);
  }, [setSeed]);

  const generateSeed = useCallback(() => {
    const seed = mnemonicGenerate();
    changeSeed(seed);
  }, [setSeed]);

  const onSeedChange = useCallback(({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    changeSeed(target.value);
  }, []);

  useEffect(() => {
    generateSeed();
  }, []);

  const onNextClick = useCallback(() => {
    onFinish({ seed, address });
  }, [seed, address]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} />
      <Text>{address}</Text>
    </AddressWrapper>
    <InputSeedWrapper>
      <SeedInput
        onChange={onSeedChange}
        value={seed}
      />
      <Button onClick={generateSeed} title='Regenerate seed' />
    </InputSeedWrapper>
    <Text color='grey-500' size='m'>
      {'The secret seed value for this account. Ensure that you keep this in a safe place, with access to the seed you can re-create the account.'}
    </Text>
    <TextStyled
      color='additional-warning-500'
      size='s'
    >
      Consider storing your account in a signer such as a browser extension, hardware device, QR-capable phone wallet (non-connected) or desktop application for optimal account security. Future versions of the web-only interface will drop support for non-external accounts, much like the IPFS version.
    </TextStyled>
    <ConfirmWrapperRow>
      <Checkbox label={'I have saved my mnemnic seed safely'}
        checked={confirmSeedSaved}
        onChange={setConfirmSeedSaved}
        size={'m'}
      />
    </ConfirmWrapperRow>
    <ButtonWrapper>
      <Button
        disabled={!address || !confirmSeedSaved}
        onClick={onNextClick}
        role='primary'
        title='Next'
      />
    </ButtonWrapper>
  </>);
};

const AskCredentialsModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish }) => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const onAccountNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const onPasswordChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    setPassword(target.value);
  }, []);

  const onConfirmPasswordChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(target.value);
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
        onChange={onPasswordChange}
        value={password}
        type='password'
      />
      <PasswordInput placeholder={'Confirm password'}
        onChange={onConfirmPasswordChange}
        value={confirmPassword}
        type='password'
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
        disabled={!validPassword || !password || !name}
        onClick={onNextClick}
        role='primary'
        title='Next'
      />
    </ButtonWrapper>
  </>);
};

const FinalModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish }) => {
  const onSaveClick = useCallback(() => {
    if (!accountProperties) return;
    onFinish(accountProperties);
  }, [accountProperties]);

  const shortSeed = useMemo(() => accountProperties?.seed.split(' ').map((value, index) => (index % 3) ? '…' : value).join(' '), [accountProperties]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} />
      <Text>{accountProperties?.address || ''}</Text>
    </AddressWrapper>
    <CredentialsWrapper >
      <ValueTextStyled>{shortSeed}</ValueTextStyled>
      <ValueTextStyled>{defaultPairType}</ValueTextStyled>
      <ValueTextStyled>{derivePath || '<none provided>'}</ValueTextStyled>
    </CredentialsWrapper>
    <ButtonWrapper>
      <Button
        onClick={onSaveClick}
        role='primary'
        title='Save'
      />
    </ButtonWrapper>
  </>);
};

export const CreateAccountModal: FC<TCreateAccountModalProps> = ({ isVisible, onFinish }) => {
  const [stage, setStage] = useState<CreateAccountModalStages>(CreateAccountModalStages.AskSeed);
  const [accountProperties, setAccountProperties] = useState<TAccountProperties>();
  const { addLocalAccount } = useAccounts();

  const ModalBodyComponent = useMemo<FC<TCreateAccountBodyModalProps> | null>(() => {
    switch (stage) {
      case CreateAccountModalStages.AskSeed:
        return AskSeedPhraseModal;
      case CreateAccountModalStages.AskCredentials:
        return AskCredentialsModal;
      case CreateAccountModalStages.Final:
        return FinalModal;
      default:
        return null;
    }
  }, [stage]);

  const onStageFinish = useCallback((accountProperties: TAccountProperties) => {
    if (stage === CreateAccountModalStages.Final) {
      if (!accountProperties) return;
      addLocalAccount(accountProperties.seed, derivePath, accountProperties.name || '', accountProperties.password || '', defaultPairType);

      onFinish();
      setStage(CreateAccountModalStages.AskSeed);
      return;
    }
    setAccountProperties(accountProperties);
    setStage(stage + 1);
  }, [stage]);

  if (!ModalBodyComponent) return null;

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onFinish}>
    <Content>
      <Heading size='2'>{`Add an account via seed ${stage + 1}/3`}</Heading>
    </Content>
    <ModalBodyComponent
      accountProperties={accountProperties}
      onFinish={onStageFinish}
    />
  </Modal>);
};

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin: calc(var(--gap) * 2) 0;
`;

const InputSeedWrapper = styled.div`
  border: 1px solid #d2d3d6;
  border-radius: 4px;
  padding: var(--gap);
  display: flex;
  margin-bottom: var(--gap);
`;

const SeedInput = styled.textarea`
  margin-bottom: 32px;
  width: 100%;
  border: none;
  height: auto;
  resize: none;
  outline: 0px none transparent;
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

const ConfirmWrapperRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: calc(var(--gap) * 1.5);
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

const ValueTextStyled = styled.div`
  border: 1px solid #d2d3d6;
  padding: 11px 12px;
  border-radius: 4px;
`;
