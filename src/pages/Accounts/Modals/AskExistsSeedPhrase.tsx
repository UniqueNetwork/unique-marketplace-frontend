import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { TCreateAccountBodyModalProps } from './types';
import { addressFromSeed } from '../../../utils/seedUtils';
import { Avatar, Button, Checkbox, Text } from '@unique-nft/ui-kit';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import styled from 'styled-components/macro';
import { AdditionalWarning100, Grey500 } from '../../../styles/colors';

export const AskExistsSeedPhraseModal: FC<TCreateAccountBodyModalProps> = ({ onFinish }) => {
  const [seed, setSeed] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [confirmSeedSaved, setConfirmSeedSaved] = useState<boolean>(false);

  const changeSeed = useCallback((value: string) => {
    setSeed(value);
    const newAddress = addressFromSeed(value, derivePath, defaultPairType);
    setAddress(newAddress);
  }, [setSeed]);

  const onSeedChange = useCallback(({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    changeSeed(target.value);
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
