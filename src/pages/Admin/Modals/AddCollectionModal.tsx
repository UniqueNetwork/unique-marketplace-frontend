import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { NFTCollection } from '../../../api/chainApi/unique/types';
import { BlueGrey100 } from '../../../styles/colors';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useAdminCollections } from '../../../api/restApi/admin/collection';
import { SelectInput } from '../../../components/SelectInput/SelectInput';
import { CollectionData } from '../../../api/restApi/admin/types';
import { useApi } from '../../../hooks/useApi';

export const AddCollectionModal: FC<TAdminPanelModalBodyProps> = ({ onFinish }) => {
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | string | undefined>();
  const { appendCollection, collections, fetchCollections } = useAdminCollections();
  const [collectionItems, setCollectionItems] = useState<CollectionData[]>([]);
  const { api } = useApi();

  useEffect(() => {
    void fetchCollections();
  }, []);

  useEffect(() => {
    setCollectionItems(collections.filter(({ status }) => status === 'Disabled'));
  }, [collections]);

  const onConfirmClick = useCallback(async () => {
    if (!selectedCollection) return;
    if (typeof selectedCollection === 'string') await appendCollection(parseInt(selectedCollection));
    else await appendCollection(selectedCollection.id);
    onFinish();
  }, [selectedCollection]);

  const onChangeSelectedCollection = useCallback(async (collection: NFTCollection | string) => {
    if (typeof collection === 'string') {
      if (!api?.collection) return;
      const collectionData = await api.collection.getCollection(Number(collection));

      if (collectionData && collectionData.tokenPrefix) {
        setCollectionItems((items) => [collectionData, ...items.filter(({ id }) => id !== collectionData.id)]);
        setSelectedCollection(collectionData);
      }
    }
    setSelectedCollection(collection as unknown as CollectionData);
  }, [setCollectionItems]);

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
        onChange={onChangeSelectedCollection}
        renderOption={(option) => <CollectionOption>
          <Avatar src={option.coverImageUrl} size={24} type={'circle'} />
          <Text>{`${option?.name || option?.collectionName} [ID ${option?.id}]`}</Text>
        </CollectionOption>}
      />
    </SelectWrapper>
    {selectedCollection && typeof selectedCollection !== 'string' && <>
      <Text size={'m'}>You have selected collection</Text>
      <CollectionNameStyled>
        <Avatar src={selectedCollection.coverImageUrl} size={24} type={'circle'} />
        <Text>{`${selectedCollection?.name || selectedCollection?.collectionName} [ID ${selectedCollection?.id}]`}</Text>
      </CollectionNameStyled>
    </>}
    <ButtonWrapper>
      <Button
        onClick={onConfirmClick}
        role='primary'
        title='Confirm'
      />
    </ButtonWrapper>
  </>);
};

const ModalWrapper = styled.div`
  
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
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
`;
