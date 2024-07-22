import React, { FC } from 'react';
import styled from 'styled-components';
import { INestingToken } from '../types';
import { INestedSectionView } from '../../TreeView/types';
import { useCollection } from '../useCollection';
import Skeleton from '../../Skeleton/Skeleton';
import { Icon, Text } from 'components/UI';
import NoTrades from 'static/icons/no-trades.svg';

export const NestedSection: FC<INestedSectionView<INestingToken>> = ({ selectedToken, onViewNodeDetails, onUnnestClick, onTransferClick }) => {
  const { isCollectionLoading, collection } = useCollection(selectedToken?.collectionId);
  return (
    <NestedDetails>
      {selectedToken && <TitleWrapper>
        <Title token={selectedToken} isCollectionLoading={isCollectionLoading} prefix={collection?.tokenPrefix || ''}/>
      </TitleWrapper>}
      {selectedToken && !selectedToken?.nestingChildTokens?.length && <NoNestedWrapper><Icon file={NoTrades} size={80}/><Text color='grey-500' size='m'>No nested tokens</Text></NoNestedWrapper>}
      {!!selectedToken?.nestingChildTokens?.length && <NestedTokens>
        {/* {selectedToken.nestingChildTokens.map((token) => (
          <TokenCard
            key={`T-${token.tokenId} C-${token.collectionId}`}
            token={token}
            onViewNodeDetails={onViewNodeDetails}
            onUnnestClick={onUnnestClick}
            onTransferClick={onTransferClick}
          />
        ))} */}
      </NestedTokens>}
    </NestedDetails>
  );
};

const NestedDetails = styled.div`
  display: block;
  padding: 16px 32px;
  background-color: var(--color-grey-100);
  width: calc(100vw - 777px);
  @media (max-width: 1440px) {
    width: calc(100vw - 729px);
  }
  @media (max-width: 1024px) {
    width: calc(100vw - 665px);
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const NestedTokens = styled.div`
  margin-top: var(--prop-gap);
  display: flex;
  flex-wrap: wrap;
  gap: var(--prop-gap);
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title: FC<{isCollectionLoading: boolean, prefix: string, token: INestingToken }> = ({ isCollectionLoading, prefix, token }) => {
  if (isCollectionLoading) return <Skeleton height={28} width={156} />;
  return (
    <Text color='additional-dark' size='l'>Nested in {prefix} #{token.tokenId}</Text>
  );
};

const NoNestedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: var(--prop-gap);
  width: 100%;
  height: 100%;
  min-height: 140px;
`;
