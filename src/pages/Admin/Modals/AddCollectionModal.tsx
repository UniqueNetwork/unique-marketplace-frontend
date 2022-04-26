import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, InputText, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { NFTCollection } from '../../../api/chainApi/unique/types';
// import { SelectInput } from '../../../components/SelectInput/SelectInput';
import { BlueGrey100 } from '../../../styles/colors';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useApi } from '../../../hooks/useApi';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';

export const AddCollectionModal: FC<TAdminPanelModalBodyProps> = ({ onClose }) => {
  // const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection>();
  const [searchString, setSearchString] = useState<string>();
  const { api } = useApi();
  const { push } = useNotification();

  const onConfirmClick = useCallback(() => {
    onClose();
  }, []);

  // const onChangeSelectedCollection = useCallback((collection: NFTCollection | string) => {
  //   if (typeof collection === 'string') return;
  //   setSelectedCollection(collection as unknown as NFTCollection);
  // }, []);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchString(value);
  }, []);

  const onSearch = useCallback(async () => {
    if (!api?.collection) return;

    const collection = await api.collection.getCollection(Number(searchString));

    if (collection) {
      setSelectedCollection(collection);
    } else {
      push({
        severity: NotificationSeverity.warning,
        message: `Collection with ID ${searchString} not found`
      });
    }
  }, [searchString, api?.collection]);

  return (<>
    <ModalWrapper>
      <Content>
        <Heading size='2'>Add collection</Heading>
      </Content>
      {/* <SelectWrapper > */}
      {/*  <SelectInput<NFTCollection> */}
      {/*    options={collections} */}
      {/*    value={selectedCollection} */}
      {/*    onChange={onChangeSelectedCollection} */}
      {/*    renderOption={(option) => <Text> */}
      {/*      {option.collectionName} */}
      {/*    </Text>} */}
      {/*  /> */}
      {/* </SelectWrapper> */}
      <CollectionSearchWrapper>
        <InputText onChange={onSearchStringChange} value={searchString} placeholder={'Collection ID'} />
        <Button title={'Search'} onClick={onSearch}/>
      </CollectionSearchWrapper>
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

// const SelectWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   row-gap: calc(var(--gap) / 2);
//   margin-bottom: calc(var(--gap) * 1.5);
//   .unique-input-text {
//     width: 100%;
//   }
// `;

const CollectionSearchWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin: calc(var(--gap) * 1.5) 0;
  & > .unique-input-text {
    flex-grow: 1;
  }
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
