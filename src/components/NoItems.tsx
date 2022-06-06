import React, { FC } from 'react';
import styled from 'styled-components';
import { Icon, Text } from '@unique-nft/ui-kit';

import NoItemsIcon from '../static/icons/no-items.svg';

const NoItems: FC = () => {
  return (
    <NoItemsWrapper>
      <Icon file={NoItemsIcon} size={80} />
      <Text size={'l'} color={'grey-500'}>No items found</Text>
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
`;

export default NoItems;
