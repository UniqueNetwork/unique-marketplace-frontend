import React, { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Button, Checkbox, Heading, Link, Select, Text, Icon, Tooltip } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TCreateAccountBodyModalProps } from './types';
import { addressFromSeed } from '../../../utils/seedUtils';

import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import { AdditionalWarning100 } from '../../../styles/colors';
import { Avatar } from 'components/Avatar/Avatar';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { IconButton } from 'components/IconButton/IconButton';

type TOption = SelectOptionProps & { id: string, title: string };

const seedGenerators: TOption[] = [
  { id: 'Mnemonic', title: 'Mnemonic' }
];

export const AskSeedPhraseModal: FC<TCreateAccountBodyModalProps> = ({ onFinish }) => {
  const [seed, setSeed] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [confirmSeedSaved, setConfirmSeedSaved] = useState<boolean>(false);
  const [seedGenerator, setSeedGenerator] = useState('Mnemonic');

  const changeSeed = useCallback((value: string) => {
    setSeed(value);
    const newAddress = addressFromSeed(value, derivePath, defaultPairType);
    setAddress(newAddress);
  }, [setSeed]);

  const generateSeed = useCallback(() => {
    const seed = mnemonicGenerate();
    changeSeed(seed);
  }, [setSeed]);

  const onSeedGeneratorChange = useCallback((value: TOption) => {
    setSeedGenerator(value.id);
  }, []);

  const onSeedChange = useCallback(({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    changeSeed(target.value);
  }, []);

  useEffect(() => {
    generateSeed();
  }, []);

  const onNextClick = useCallback(() => {
    if (!address || !confirmSeedSaved) return;
    onFinish({ seed, address });
  }, [seed, address, confirmSeedSaved, onFinish]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} address={address} />
      <Text color={'grey-500'}>{address}</Text>
    </AddressWrapper>
    <Heading size={'4'} >The secret seed value for this account</Heading>
    {seedGenerators.length > 1 && <SeedGeneratorSelectWrapper>
      <Select options={seedGenerators} value={seedGenerator} onChange={onSeedGeneratorChange} />
      <Tooltip content={<div><Icon name={'question'} size={24} color={'var(--color-primary-500)'} /></div>} placement={'top'} >
        <>Find out more on <TooltipLink href='https://' title={'Polkadot Wiki'}>Polkadot Wiki</TooltipLink></>
      </Tooltip>
    </SeedGeneratorSelectWrapper>}
    <InputSeedWrapper>
      <SeedInput
        onChange={onSeedChange}
        value={seed}
      />
      <IconButton onClick={generateSeed} size={24} name={'replace'}/>
    </InputSeedWrapper>
    <TextStyled
      color='additional-warning-500'
      size='s'
    >
      Ensure that you keep this seed in a safe place. Anyone with access to it can re-create the account and gain full access to it.
    </TextStyled>
    <ConfirmWrapperRow>
      <Checkbox label={'I have saved my mnemonic seed safely'}
        checked={confirmSeedSaved}
        onChange={setConfirmSeedSaved}
        size={'m'}
      />
    </ConfirmWrapperRow>
    <ButtonWrapper>
      <StepsTextStyled size={'m'}>Step 1/3</StepsTextStyled>
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
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) * 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: 20px var(--gap);
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const SeedGeneratorSelectWrapper = styled.div`
  display: flex;
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: var(--gap);
  align-items: center;
  column-gap: 10px;
  .unique-select {
    flex-grow: 1;
  }
`;

const InputSeedWrapper = styled.div`
  display: flex;
  margin-bottom: var(--gap);
  column-gap: calc(var(--gap) / 2);
  align-items: flex-start;
`;

const SeedInput = styled.textarea`
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  width: 100%;
  height: auto;
  resize: none;
  outline: 0px none transparent;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
`;

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: var(--gap) 0;
  border-radius: var(--gap);
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const ConfirmWrapperRow = styled.div`
  display: flex;
  margin-bottom: calc(var(--gap) * 1.5);
`;

const StepsTextStyled = styled(Text)`
  flex-grow: 1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const TooltipLink = styled(Link)`
  color: var(--color-additional-light);
  text-decoration: underline;
`;
