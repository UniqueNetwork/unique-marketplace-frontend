import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { Button, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TCreateAccountBodyModalProps } from './types';
import { addressFromSeed } from '../../../utils/seedUtils';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import { Avatar } from 'components/Avatar/Avatar';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { shortcutText } from '../../../utils/textUtils';

export const AskExistsSeedPhraseModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish }) => {
  const [seed, setSeed] = useState<string>(accountProperties?.seed || '');
  const [address, setAddress] = useState<string>(accountProperties?.address || '');
  const deviceSize = useDeviceSize();

  const changeSeed = useCallback((value: string) => {
    if (!value) {
      setAddress('');
      setSeed('');
      return;
    }
    setSeed(value);
    const newAddress = addressFromSeed(value, derivePath, defaultPairType);
    setAddress(newAddress);
  }, [setSeed]);

  const onSeedChange = useCallback(({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    changeSeed(target.value);
  }, []);

  const onNextClick = useCallback(() => {
    if (!seed) return;
    onFinish({ seed, address });
  }, [seed, address]);

  return (<>
    <AddressWrapper>
      {address && <><Avatar size={24} src={DefaultAvatar} address={address} />
        <Text size={'s'} color={'grey-500'}>{deviceSize === DeviceSize.sm ? shortcutText(address) : address}</Text>
      </>}
      {!address && <Text size={'s'} color={'grey-400'}>The account address will appear while entering the secret seed{deviceSize === DeviceSize.sm ? '...' : ' value'}</Text>}
    </AddressWrapper>
    <InputSeedWrapper>
      <Text>The secret seed value</Text>
      <SeedInput
        onChange={onSeedChange}
        value={seed}
        rows={deviceSize === DeviceSize.sm ? 3 : 1}
      />
    </InputSeedWrapper>
    <ButtonWrapper>
      <StepsTextStyled size={'m'}>Step 1/3</StepsTextStyled>
      <Button
        disabled={!address}
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
    &.color-grey-400 {
      color: var(--color-grey-400);
    }
  }
  @media (max-width: 567px) {
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    padding: 0 16px;
    height: 62px;
    align-items: baseline;
    &>div {
      margin: auto 0;
    }
    .unique-text {
      margin: auto 0;
    }
  }
`;

const InputSeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  width: 100%;
`;

const SeedInput = styled.textarea`
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  width: calc(100% - var(--gap) * 2);
  height: auto;
  resize: none;
  outline: 0px none transparent;
  margin-top: var(--gap);
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
`;

const StepsTextStyled = styled(Text)`
  flex-grow: 1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
`;
