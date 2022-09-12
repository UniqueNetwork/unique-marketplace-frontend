import React, { FC } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Grey100 } from 'styles/colors';
import { INestingToken } from '../types';
import TokenCard from './TokenCard';
import { INestedSectionView } from '../../TreeView/types';
import { useCollection } from '../useCollection';
import Skeleton from '../../Skeleton/Skeleton';

export const NestedSection: FC<INestedSectionView<INestingToken>> = ({ selectedToken, onViewNodeDetails }) => {
  const { isCollectionLoading, collection } = useCollection(selectedToken?.collectionId);
  return (
    <NestedDetails>
      {selectedToken && <Title token={selectedToken} isCollectionLoading={isCollectionLoading} prefix={collection?.tokenPrefix || ''}/>}
      <NestedTokens>
        {selectedToken?.nestingChildTokens?.map((token) => (
          <TokenCard key={`T-${token.tokenId} C-${token.collectionId}`} token={token} onViewNodeDetails={onViewNodeDetails}/>
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

const Title: FC<{isCollectionLoading: boolean, prefix: string, token: INestingToken }> = ({ isCollectionLoading, prefix, token }) => {
  if (isCollectionLoading) return <Skeleton height={28} width={156} />;
  return (
    <Text color='additional-dark' size='l'>Nested in {prefix} #{token.tokenId}</Text>
  );
};
