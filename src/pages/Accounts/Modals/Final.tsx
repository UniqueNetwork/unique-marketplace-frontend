import React, { FC, useCallback, useMemo } from 'react';
import { Button, Icon, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import { TCreateAccountBodyModalProps } from './types';
import { AdditionalWarning100, Grey300 } from '../../../styles/colors';
import { Tooltip } from '../../../components/Tooltip/Tooltip';
import Question from '../../../static/icons/question.svg';
import { Avatar } from '../../../components/Avatar/Avatar';

export const FinalModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish, onGoBack }) => {
  const onSaveClick = useCallback(() => {
    if (!accountProperties) return;
    onFinish(accountProperties);
  }, [accountProperties]);

  const shortSeed = useMemo(() => accountProperties?.seed.split(' ').map((value, index) => (index % 3) ? '…' : value).join(' '), [accountProperties]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} address={accountProperties?.address} />
      <Text>{accountProperties?.address || ''}</Text>
    </AddressWrapper>
    <CredentialsWrapper >
      <LabelTextWrapper>
        <Text size={'m'}>Partial seed</Text>
        <Tooltip title={'The seed is your key to the account. Knowing the seed allows you, or anyone else who knows the seed, to re-generate and control this account.'} placement={'right'} >
          <Icon file={Question} size={24} />
        </Tooltip>
      </LabelTextWrapper>
      <ValueTextStyled>{shortSeed}</ValueTextStyled>
      <LabelTextWrapper>
        <Text size={'m'}>Keypair type</Text>
        <Tooltip title={'Substrate supports a number of different crypto mechanisms. As such the keyring allows for the creation and management of different types of crypto.'} placement={'right'} >
          <Icon file={Question} size={24} />
        </Tooltip>
      </LabelTextWrapper>
      <ValueTextStyled>{defaultPairType}</ValueTextStyled>
      <LabelTextWrapper>
        <Text size={'m'}>Derivation path</Text>
        <Tooltip title={'If you would like to create and manage several accounts on the network using the same seed, you can use derivation paths.'} placement={'right'}>
          <Icon file={Question} size={24} />
        </Tooltip>
      </LabelTextWrapper>
      <ValueTextStyled>{derivePath || 'None provided'}</ValueTextStyled>
    </CredentialsWrapper>
    <TextStyled
      color='additional-warning-500'
      size='s'
    >
      Consider storing your account in a signer such as a browser extension, hardware device, QR-capable phone wallet (non-connected) or desktop application for optimal account security. Future versions of the web-only interface will drop support for non-external accounts, much like the IPFS version.
    </TextStyled>
    <TextStyled
      color='additional-warning-500'
      size='s'
    >
      You will be provided with a generated backup file after your account is created. Please make sure to save this file in a secure location as it is required, together with your password, to restore your account.
    </TextStyled>
    <ButtonWrapper>
      <StepsTextStyled size={'m'}>Step 3/3</StepsTextStyled>
      <Button
        onClick={onGoBack}
        title='Previous'
      />
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
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) / 2);
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

const LabelTextWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  margin-top: calc(var(--gap) * 1.5);
`;

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: var(--gap) 0;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: var(--gap);
  margin-top: calc(var(--gap) * 2);
`;

const CredentialsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 2);
  .unique-input-text {
    width: 100%;
  }
`;

const ValueTextStyled = styled.div`
  border: 1px solid ${Grey300};
  padding: 11px 12px;
  border-radius: 4px;
  background-color: var(--color-grey-100);
`;
