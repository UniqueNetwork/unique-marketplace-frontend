import React, { VFC } from 'react';
import styled from 'styled-components';
import { Icon, Text } from '@unique-nft/ui-kit';

interface NoItemsProps {
  isSearchResult?: boolean
}

const NoItems: VFC<NoItemsProps> = ({ isSearchResult }) => {
  return (
    <NoItemsWrapper>
      <Icon name={isSearchResult ? 'magnifier-found' : 'not-found'} size={80} />
      <Text size={'l'} color={'blue-grey-500'}>Nothing found</Text>
    </NoItemsWrapper>
  );
};

const NoItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 1.5);
  width: 100%;
  height: 640px;
  align-items: center;
  justify-content: center;
  @media (max-width: 567px) {
    height: 340px;
  }
`;

export default NoItems;
