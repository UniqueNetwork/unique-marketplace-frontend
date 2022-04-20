import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import { NFTCollection } from '../../../api/chainApi/unique/types';
import { SelectInput } from '../../../components/SelectInput/SelectInput';
import { BlueGrey100 } from '../../../styles/colors';
import { Avatar } from '../../../components/Avatar/Avatar';

export const AddCollectionModal: FC<TAdminPanelModalBodyProps> = ({ onClose }) => {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection>();

  const onConfirmClick = useCallback(() => {
    onClose();
  }, []);

  const onChangeSelectedCollection = useCallback((collection: NFTCollection | string) => {
    if (typeof collection === 'string') return;
    setSelectedCollection(collection as unknown as NFTCollection);
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Add collection</Heading>
      </Content>
      <SelectWrapper >
        <SelectInput<NFTCollection>
          options={collections}
          value={selectedCollection}
          onChange={onChangeSelectedCollection}
          renderOption={(option) => <Text>
            {option.collectionName}
          </Text>}
        />
      </SelectWrapper>
      {selectedCollection && <>
        <Text size={'m'}>You have selected collection</Text>

        <CollectionNameStyled>
          <Avatar src={selectedCollection.coverImageUrl} size={24} type={'circle'} />
          <Text>{`${selectedCollection?.collectionName} [ID ${selectedCollection?.id}]`}</Text>
        </CollectionNameStyled>
      </>}
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

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 1.5);
  .unique-input-text {
    width: 100%;
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
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
