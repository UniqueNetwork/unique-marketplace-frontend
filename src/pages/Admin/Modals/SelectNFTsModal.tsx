import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { useAdminCollections } from '../../../api/restApi/admin/collection';
import { TextInput } from 'components/TextInput/TextInput';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

export const SelectNFTsModal: FC<TAdminPanelModalBodyProps> = ({ collection, onFinish }) => {
  const { setAllowedTokens } = useAdminCollections();
  const [tokens, setTokens] = useState(collection?.allowedTokens || '');
  const [isInvalidTokensValue, setIsInvalidTokensValue] = useState<boolean>(false);
  const { push } = useNotification();

  const onAcceptClick = useCallback(async () => {
    if (!collection?.id) return;
    if (tokens && !/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(tokens)) {
      setIsInvalidTokensValue(true);
      return;
    }
    try {
      await setAllowedTokens(collection?.id, tokens);
    } catch (err) {
      setIsInvalidTokensValue(true);
      return;
    }

    push({ message: `Add allowed tokens: ${tokens} for collection: ${collection?.id}`, severity: NotificationSeverity.success });
    onFinish();
  }, [collection, tokens]);

  const onTokensChanged = useCallback((value: string) => {
    if (!value || /^[\d\-,]+$/.test(value)) {
      setTokens(value);
    }
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Select NFTs</Heading>
      </Content>
      <Row>
        <Text size='m'>Specify the IDs of the tokens that you want to put up for sale on the marketplace</Text>
      </Row>
      <Row>
        <Text size='s' color='grey-500'>You can enter individual numbers separated by commas and intervals separated by hyphens</Text>
      </Row>
      <InputWrapper>
        <TextInput placeholder='ID of the tokens'
          value={tokens}
          onChange={onTokensChanged}
          errorText={isInvalidTokensValue ? 'List of token IDs is incorrect' : undefined}
        />
      </InputWrapper>
      <ButtonWrapper>
        <Button
          onClick={onAcceptClick}
          role='primary'
          title='Accept'
        />
      </ButtonWrapper>
    </>
  );
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const Row = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
`;

const InputWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 2);
  &>div {
    width: 100%;
    .unique-input-text {
      width: 100%;
    }
  }
  
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
