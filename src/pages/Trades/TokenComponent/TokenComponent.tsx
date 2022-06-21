import React from 'react';
import { Link } from 'react-router-dom';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Avatar } from '../../../components/Avatar/Avatar';
import { Trade } from '../../../api/restApi/trades/types';

export const TokenComponent = ({ collectionId, tokenId, tokenDescription }: Pick<Trade, 'collectionId' | 'tokenId' | 'tokenDescription'>) => {
  return <Link to={`/token/${collectionId}/${tokenId}`}>
    <TokenComponentWrapper>
      <Avatar src={tokenDescription.image || ''} size={40} type={'square'} />
      <Text>{`${tokenDescription.prefix} #${tokenId}`}</Text>
    </TokenComponentWrapper>
  </Link>;
};

const TokenComponentWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  align-items: center;
  padding: calc(var(--gap) / 2) 0 !important;
  @media (max-width: 768px) {
    width: 100%;
    .unique-input-text {
      flex-grow: 1;
    }
  }
`;
