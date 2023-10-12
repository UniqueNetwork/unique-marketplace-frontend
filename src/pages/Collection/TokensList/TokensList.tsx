import { FC } from 'react';
import styled from 'styled-components';

import { TokenByIdResponse } from '@unique-nft/sdk';
import { Offer } from 'api/restApi/offers/types';
import { Token } from 'api/restApi/tokens/types';
import { MyToken } from 'pages/MyTokens/types';
import { TokensCard } from 'components';
import CardSkeleton from 'components/Skeleton/CardSkeleton';

type TTokensList = {
  tokens: (Omit<TokenByIdResponse | MyToken, 'collection' | 'nestingParentToken' | 'properties'> | Offer | Token)[]
  isLoading?: boolean
  showOwner?: boolean
  testid: string
};

export const TokensList: FC<TTokensList> = ({ tokens, isLoading, showOwner, testid }) => {
  return (
    <TokensListStyled>
      {(!isLoading && tokens?.map) &&
        tokens.map((token, index) => (
          <TokensCard
            key={`token-${token?.collectionId || ''}-${token?.tokenId}-${index}`}
            tokenId={token?.tokenId}
            collectionId={token?.collectionId}
            {...('seller' in token ? { offer: token } : { token })}
            testid={`${testid}-card`}
            showOwner={showOwner}
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
