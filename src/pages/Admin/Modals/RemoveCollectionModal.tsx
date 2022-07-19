import React, { FC, useCallback } from 'react';
import { Button, Heading, Text, useNotifications } from '@unique-nft/ui-kit';
import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import styled from 'styled-components/macro';
import { useAdminCollections } from '../../../api/restApi/admin/collection';

export const RemoveCollectionModal: FC<TAdminPanelModalBodyProps> = ({ collection, onFinish }) => {
  const { removeCollection } = useAdminCollections();
  const { info } = useNotifications();

  const onConfirmClick = useCallback(async () => {
    if (!collection) return;
    void await removeCollection(collection.id);
    info(
      `Collection ${collection.id} successfully disabled`,
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );
    onFinish();
  }, [info]);

  const collectionName = collection?.name || collection?.collectionName || '';

  return (
    <>
      <Content>
        <Heading size='2'>Remove collection</Heading>
      </Content>
      <Row>
        <Text size={'m'}>{`Are you sure you want to remove the collection ${collectionName ? `"${collectionName}"` : ''} [id ${collection?.id}] from the marketplace?`}</Text>
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
  @media (max-width: 567px) {
    && h2 {
      font-size: 24px;
      line-height: 36px;
      width: 100% !important;
    }
  }
`;

const Row = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  @media (max-width: 567px) {
    button {
      width: 100%;
    }
  }
`;
