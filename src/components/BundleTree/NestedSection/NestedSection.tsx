import React, { FC } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Grey100 } from 'styles/colors';
import { INestedSection } from '../types';
import TokenCard from './TokenCard';

export const NestedSection: FC<INestedSection> = ({ selectedToken }) => {
  return (
    <NestedDetails>
      {selectedToken && <Text color='additional-dark' size='l'>Nested in T-{selectedToken.tokenId} C-{selectedToken.collectionId}</Text>}
      <NestedTokens>
        {selectedToken?.nestingChildTokens?.map((token) => (
          <TokenCard key={`T-${token.tokenId} C-${token.collectionId}`} token={token}/>
        ))}
      </NestedTokens>
    </NestedDetails>
  );
};

const NestedDetails = styled.div`
  display: block;
  padding: 16px 32px;
  background-color: ${Grey100};
  width: calc(100vw - 780px);
  @media (max-width: 1440px) {
    width: calc(100vw - 730px);
  }
  @media (max-width: 1024px) {
    width: calc(100vw - 667px);
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const NestedTokens = styled.div`
  margin-top: var(--gap);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;
