import { FC } from 'react';
import styled from 'styled-components';

import { TokensCard } from '..';
import CardSkeleton from '../Skeleton/CardSkeleton';
import { MyToken } from '../../pages/MyTokens/types';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { Offer } from 'api/restApi/offers/types';
import { Token } from 'api/restApi/tokens/types';

type TTokensList = {
  tokens: (Omit<TokenByIdResponse | MyToken, 'collection' | 'nestingParentToken' | 'properties'> | Offer | Token)[]
  isLoading?: boolean
  testid: string
};

export const TokensList: FC<TTokensList> = ({ tokens, isLoading, testid }) => {
  return (
    <TokensListStyled>
      {(!isLoading && tokens) &&
        tokens.map((token, index) => (
          <TokensCard
            key={`token-${token?.collectionId || ''}-${token?.tokenId}-${index}`}
            tokenId={token?.tokenId}
            collectionId={token?.collectionId}
            {...('seller' in token ? { offer: token } : { token })}
            testid={`${testid}-card`}
          />
        ))}

      {isLoading && Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={`card-skeleton-${index}`} />)}
    </TokensListStyled>
  );
};

const TokensListStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; 
  gap: 16px;

  @media (max-width: 1919px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1489px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1223px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 567px) {
    display: flex;
    flex-direction: column;
  }
`;
