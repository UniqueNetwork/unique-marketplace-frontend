import React, { VFC } from 'react';
import styled from 'styled-components';
import { Text } from 'components/UI';
import { Icon } from 'components/UI/Icon/Icon';

interface NoItemsProps {
  isSearchResult?: boolean
  noItemsText?: string
}

const NoItems: VFC<NoItemsProps> = ({ isSearchResult, noItemsText = 'Nothing found' }) => {
  return (
    <NoItemsWrapper>
      <Icon name={isSearchResult ? 'magnifier-found' : 'not-found'} size={80} />
      <Text size={'l'} color={'blue-grey-500'}>{noItemsText}</Text>
    </NoItemsWrapper>
  );
};

const NoItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--prop-gap) * 1.5);
  width: 100%;
  height: 640px;
  align-items: center;
  justify-content: center;
  @media (max-width: 567px) {
    height: 340px;
  }
  span {
    text-align: center;
  }
`;

export default NoItems;
