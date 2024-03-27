import React, { FC, useCallback, useEffect, useState } from 'react';
import { Text, useNotifications, Button, Heading } from 'components/UI';
import styled from 'styled-components/macro';

import { useApi } from 'hooks/useApi';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { SelectInput } from 'components/SelectInput/SelectInput';
import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { BlueGrey100 } from 'styles/colors';
import { useAccounts } from 'hooks/useAccounts';
import { useCollections } from 'hooks/useCollections';
import { GQLCollection } from 'api/scanApi/types';

export const AddCollectionModal: FC<TAdminPanelModalBodyProps> = ({ onFinish, collection }) => {
  const { selectedAccount } = useAccounts();
  const [selectedCollection, setSelectedCollection] = useState<GQLCollection | string | undefined>(collection);
  const { appendCollection, collections, fetchCollections } = useCollections();
  const [collectionItems, setCollectionItems] = useState<GQLCollection[]>([]);
  const { api } = useApi();
  const { info, error } = useNotifications();

  useEffect(() => {
    if (!selectedAccount) return;
    void fetchCollections(selectedAccount);
  }, []);

  const onConfirmClick = useCallback(async () => {
    if (!selectedCollection) return;
    const collectionId = typeof selectedCollection === 'string' ? Number(selectedCollection) : selectedCollection.id;
    if (collections.find(({ id, isMarketable }) => id.toString() === collectionId.toString() && isMarketable)) {
      error(
        `Collection [ID ${collectionId}] is already enabled`,
        { name: 'warning', size: 16, color: 'var(--color-additional-light)' }
      );
      return;
    }
    await appendCollection(collectionId);

    info(
      `Collection [ID ${collectionId}] successfully enabled`,
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );
    onFinish();
  }, [selectedCollection, collections]);

  const findCollection = useCallback((searchString: string) => {
    const collectionData = collections
      .filter((myCollection) =>
        myCollection.id.toString().includes(searchString) ||
        myCollection.name.includes(searchString) ||
        myCollection.tokenPrefix.includes(searchString));
    setCollectionItems(collectionData);
  }, [api, collections]);

  const onChangeSelectedCollection = useCallback((collection: GQLCollection | string) => {
    if (typeof collection === 'string') {
      if (!/^\d{0,9}$/.test(collection) && collection !== '') return;

      void findCollection(collection);
    }
    setSelectedCollection(collection as unknown as GQLCollection);
  }, [findCollection]);

  return (<>
    <Content>
      <Heading size='2'>Add collection</Heading>
    </Content>
    <SelectWrapper>
      <SelectInput<GQLCollection>
        isClearable
        placeholder='Search by id'
        options={collectionItems}
        value={selectedCollection}
        leftIcon={{ name: 'magnify', size: 16 }}
        onChange={onChangeSelectedCollection}
        renderOption={(option) => <CollectionOption>
          <CollectionCover src={option.cover || ''} size={24} type={'circle'} />
          <Text>{`${option?.name} [ID ${option?.id}]`}</Text>
        </CollectionOption>}
      />
    </SelectWrapper>
    {selectedCollection && typeof selectedCollection !== 'string' && <>
      <Text size={'m'}>You have selected collection</Text>
      <CollectionNameStyled>
        <CollectionCover src={selectedCollection.cover || ''} size={24} type={'circle'} />
        <Text>{`${selectedCollection?.name} [ID ${selectedCollection?.id}]`}</Text>
      </CollectionNameStyled>
    </>}
    <ButtonWrapper>
      <Button
        onClick={onConfirmClick}
        role='primary'
        title='Confirm'
        disabled={!selectedCollection || Number(selectedCollection) === 0}
      />
    </ButtonWrapper>
  </>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
  @media (max-width: 567px) {
    && h2 {
      font-size: 24px;
      line-height: 36px;
    }
  }
`;

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin: calc(var(--gap) * 1.5) 0;
  .unique-input-text {
    width: 100%;
  }
`;

const CollectionOption = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;

const CollectionNameStyled = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${BlueGrey100};
  width: 100%;
  column-gap: calc(var(--gap) / 2);
  margin-top: calc(var(--gap) * 1.5);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    width: 110px;
  }
`;
