import React, { useMemo } from 'react';
import { generatePath, Link } from 'react-router-dom';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { Avatar } from 'components/Avatar/Avatar';
import { Trade } from 'api/restApi/trades/types';
import { useApi } from 'hooks/useApi';

export const TokenComponent = ({ collectionId, tokenId, tokenDescription }: Pick<Trade, 'collectionId' | 'tokenId' | 'tokenDescription'>) => {
  const { currentChainId } = useApi();
  const tokenUrl = useMemo(() => generatePath('/:currentChainId/token/:collectionId/:tokenId', {
    currentChainId,
    collectionId: collectionId?.toString(),
    tokenId: tokenId?.toString()
  }), [currentChainId, collectionId, tokenId]);

  return <Link to={tokenUrl}>
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
