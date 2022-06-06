import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, InputText, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { useAdminCollections } from '../../../api/restApi/admin/collection';
import { useNotification } from '../../../hooks/useNotification';
import { NotificationSeverity } from '../../../notification/NotificationContext';

export const SelectNFTsModal: FC<TAdminPanelModalBodyProps> = ({ collection, onFinish }) => {
  const { push } = useNotification();
  const { setAllowedTokens } = useAdminCollections();
  const [tokens, setTokens] = useState(collection?.allowedTokens || '');

  const onAcceptClick = useCallback(async () => {
    if (!collection?.id) return;
    if (!/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(tokens)) {
      push({ severity: NotificationSeverity.warning, message: 'List of token IDs is incorrect' });
      return;
    }

    await setAllowedTokens(collection?.id, tokens);
    onFinish();
  }, [collection, tokens]);

  const onTokensChanged = useCallback((value: string) => {
    setTokens(value);
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Select NFTs</Heading>
      </Content>
      <Row>
        <Text size='m'>Specify the ID of the tokens that you want to put up for sale on the marketplace</Text>
      </Row>
      <Row>
        <Text size='s' color='grey-500'>You can enter individual numbers separated by commas and intervals separated by hyphens</Text>
      </Row>
      <InputWrapper>
        <InputText placeholder='ID of the tokens' value={tokens} onChange={onTokensChanged} />
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
  .unique-input-text {
    width: 100%;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
