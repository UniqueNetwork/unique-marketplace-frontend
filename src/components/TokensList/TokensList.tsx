import { FC } from 'react';
import styled from 'styled-components';

import { Offer } from 'api/restApi/offers/types';
import { TokensCard } from '..';
import CardSkeleton from '../Skeleton/CardSkeleton';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';

type TTokensList = {
  tokens: (TokenByIdResult & Partial<Offer>)[]
  isLoading?: boolean
  testid: string
};

export const TokensList: FC<TTokensList> = ({ tokens, isLoading, testid }) => {
  return (
    <TokensListStyled>
      {(!isLoading && tokens?.map) &&
        tokens.map((token) => (
          <TokensCard
            key={`token-${token?.collectionId || ''}-${token?.tokenId}`}
            tokenId={token?.tokenId}
            collectionId={token?.collectionId}
            {...('seller' in token ? { offer: token } : { token })}
            testid={`${testid}-card`}
            badge={(token.isBundle || token.nestingChildTokens) ? 'Bundle' : ''}
          />
        ))}

      {isLoading && Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={`card-skeleton-${index}`} />)}
    </TokensListStyled>
  );
};

const TokensListStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 32px;

  @media (max-width: 1919px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1439px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 567px) {
    display: flex;
    flex-direction: column;
  }
`;
