import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { useAdminCollections } from '../../../api/restApi/admin/collection';
import { TextInput } from 'components/TextInput/TextInput';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

const MAX_SAFE_ID = 2147483647;

const NOT_VALID_TOKEN_MESSAGE = 'List of token IDs is incorrect. It must be like "1-10,20" and values can be between 1-2147483647';

export const SelectNFTsModal: FC<TAdminPanelModalBodyProps> = ({ collection, onFinish }) => {
  const { setAllowedTokens } = useAdminCollections();
  const [tokens, setTokens] = useState(collection?.allowedTokens || '');
  const { push } = useNotification();

  const isValidAllowedTokens = useMemo(() => {
    if (tokens === '') return true;
    if (tokens && !/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(tokens)) {
      return false;
    }
    if (tokens.split(',').some((value) => {
      if (value.includes('-')) { // its range like 1-100
        const [start, end] = value.split('-').map(Number);
        return start > end || start === 0 || end === 0 || start > MAX_SAFE_ID || end > MAX_SAFE_ID;
      } else { // its single value
        return Number(value) > MAX_SAFE_ID || Number(value) === 0;
      }
      return false;
    })) return false;

    return true;
  }, [tokens]);

  const onAcceptClick = useCallback(async () => {
    if (!collection?.id) return;
    if (!isValidAllowedTokens) return;

    await setAllowedTokens(collection?.id, tokens);

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
          errorText={!isValidAllowedTokens ? NOT_VALID_TOKEN_MESSAGE : undefined}
        />
      </InputWrapper>
      <ButtonWrapper>
        <Button
          onClick={onAcceptClick}
          role='primary'
          title='Accept'
          disabled={!isValidAllowedTokens}
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
