import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Heading, Text, useNotifications } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { NFTCollection } from '../../../api/chainApi/unique/types';
import { BlueGrey100 } from '../../../styles/colors';
import { useAdminCollections } from '../../../api/restApi/admin/collection';
import { SelectInput } from '../../../components/SelectInput/SelectInput';
import { CollectionData } from '../../../api/restApi/admin/types';
import { useApi } from '../../../hooks/useApi';
import { CollectionCover } from '../../../components/CollectionCover/CollectionCover';

export const AddCollectionModal: FC<TAdminPanelModalBodyProps> = ({ onFinish }) => {
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | string | undefined>();
  const { appendCollection, collections, fetchCollections } = useAdminCollections();
  const [collectionItems, setCollectionItems] = useState<CollectionData[]>([]);
  const { api } = useApi();
  const { info, error } = useNotifications();

  useEffect(() => {
    void fetchCollections();
  }, []);

  useEffect(() => {
    setCollectionItems(collections.filter(({ status }) => status === 'Disabled'));
  }, [collections]);

  const onConfirmClick = useCallback(async () => {
    if (!selectedCollection) return;
    const collectionId = typeof selectedCollection === 'string' ? Number(selectedCollection) : selectedCollection.id;
    if (collections.find(({ id }) => id.toString() === collectionId.toString())?.status === 'Enabled') {
      error(
        `Collection [ID ${collectionId}] has already enabled`,
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

  const getCollection = useCallback(async (collection: string) => {
    if (!api?.collection) return;
    const collectionData = await api.collection.getCollection(Number(collection));

    setCollectionItems([
      ...(collectionData && collectionData.tokenPrefix ? [collectionData] : []),
      ...collections.filter(({ id, status }) => status === 'Disabled' && id.toString().includes(collection) && id !== collectionData?.id)
    ]);
  }, [api, collections]);

  const onChangeSelectedCollection = useCallback((collection: NFTCollection | string) => {
    if (typeof collection === 'string') {
      if (!/^\d{0,9}$/.test(collection) && collection !== '') return;

      void getCollection(collection);
    }
    setSelectedCollection(collection as unknown as CollectionData);
  }, [getCollection]);

  return (<>
    <Content>
      <Heading size='2'>Add collection</Heading>
    </Content>
    <SelectWrapper>
      <SelectInput<CollectionData>
        isClearable
        placeholder='Search by id'
        options={collectionItems}
        value={selectedCollection}
        leftIcon={{ name: 'magnify', size: 16 }}
        onChange={onChangeSelectedCollection}
        renderOption={(option) => <CollectionOption>
          <CollectionCover src={option.coverImageUrl} size={24} type={'circle'} />
          <Text>{`${option?.name || option?.collectionName} [ID ${option?.id}]`}</Text>
        </CollectionOption>}
      />
    </SelectWrapper>
    {selectedCollection && typeof selectedCollection !== 'string' && <>
      <Text size={'m'}>You have selected collection</Text>
      <CollectionNameStyled>
        <CollectionCover src={selectedCollection.coverImageUrl} size={24} type={'circle'} />
        <Text>{`${selectedCollection?.name || selectedCollection?.collectionName} [ID ${selectedCollection?.id}]`}</Text>
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
