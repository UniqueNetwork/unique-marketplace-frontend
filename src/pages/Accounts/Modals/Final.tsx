import React, { FC, useCallback, useMemo } from 'react';
import { TCreateAccountBodyModalProps } from './types';
import { Avatar, Button, Text } from '@unique-nft/ui-kit';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import styled from 'styled-components/macro';
import { defaultPairType, derivePath } from './CreateAccount';

export const FinalModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish }) => {
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

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin: calc(var(--gap) * 2) 0;
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

const ValueTextStyled = styled.div`
  border: 1px solid #d2d3d6;
  padding: 11px 12px;
  border-radius: 4px;
`;
