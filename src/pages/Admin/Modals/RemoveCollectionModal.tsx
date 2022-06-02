import React, { FC, useCallback } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import styled from 'styled-components/macro';
import { useAdminCollections } from '../../../api/restApi/admin/collection';

export const RemoveCollectionModal: FC<TAdminPanelModalBodyProps> = ({ collection, onFinish }) => {
  const { remove } = useAdminCollections();

  const onConfirmClick = useCallback(async () => {
    if (!collection) return;
    void await remove(collection.id);
    onFinish();
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Remove collection</Heading>
      </Content>
      <Row>
        <Text size={'m'}>Are you sure you want to remove the collection “name” from the marketplace?</Text>
      </Row>
      <ButtonWrapper>
        <Button
          onClick={onConfirmClick}
          role='primary'
          title='Confirm'
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
