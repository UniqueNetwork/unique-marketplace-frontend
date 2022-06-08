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

export const AddCollectionModal: FC<TAdminPanelModalBodyProps> = ({ onFinish }) => {
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection>();
  const { appendCollection, collections, fetchCollections } = useAdminCollections();

  useEffect(() => {
    void fetchCollections();
  }, []);

  const onConfirmClick = useCallback(async () => {
    if (!selectedCollection) return;
    await appendCollection(selectedCollection.id);
    onFinish();
  }, [selectedCollection]);

  const onChangeSelectedCollection = useCallback((collection: NFTCollection | string) => {
    if (typeof collection === 'string') return;
    setSelectedCollection(collection as unknown as NFTCollection);
  }, []);

  return (<>
    <ModalWrapper>
      <Content>
        <Heading size='2'>Add collection</Heading>
      </Content>
      <SelectWrapper>
        <SelectInput<CollectionData>
          options={collections.filter(({ status }) => status === 'Disabled')}
          value={selectedCollection}
          onChange={onChangeSelectedCollection}
          renderOption={(option) => <CollectionOption>
            <Avatar src={option.coverImageUrl} size={24} type={'circle'} />
            <Text>{`${option?.name} [ID ${option?.id}]`}</Text>
          </CollectionOption>}
        />
      </SelectWrapper>
      {selectedCollection && <>
        <Text size={'m'}>You have selected collection</Text>

        <CollectionNameStyled>
          <Avatar src={selectedCollection.coverImageUrl} size={24} type={'circle'} />
          <Text>{`${selectedCollection?.collectionName} [ID ${selectedCollection?.id}]`}</Text>
        </CollectionNameStyled>
      </>}
    </ModalWrapper>
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
  height: 250px;
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
