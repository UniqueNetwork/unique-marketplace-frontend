import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { Button, Checkbox, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TCreateAccountBodyModalProps } from './types';
import { addressFromSeed } from '../../../utils/seedUtils';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import { Grey300 } from '../../../styles/colors';
import { Avatar } from 'components/Avatar/Avatar';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';

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
      <Avatar size={24} src={DefaultAvatar} address={address} />
      <Text>{address}</Text>
    </AddressWrapper>
    <InputSeedWrapper>
      <SeedInput
        onChange={onSeedChange}
        value={seed}
      />
    </InputSeedWrapper>
    <WarningBlock>
      Ensure that you keep this seed in a safe place. Anyone with access to it can re-create the account and gain full access to it.
    </WarningBlock>
    <ConfirmWrapperRow>
      <Checkbox label={'I have saved my mnemnic seed safely'}
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
  margin: calc(var(--gap) * 2) 0;
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: 20px var(--gap);
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const InputSeedWrapper = styled.div`
  border: 1px solid ${Grey300};
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
`;
