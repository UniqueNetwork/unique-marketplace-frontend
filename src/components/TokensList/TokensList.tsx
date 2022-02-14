import { FC } from 'react';
import styled from 'styled-components/macro';
import { TokensCard } from '..';
import { Offer } from '../../api/restApi/offers/types';

type TTokensList = {
  offers: Offer[];
};

export const TokensList: FC<TTokensList> = ({ offers }) => {
  return (
    <TokensListStyled>
      {offers?.map &&
        offers.map((offer: Offer) => (
          <TokensCard
            key={`token-${offer.collectionId}-${offer.tokenId}`}
            tokenId={offer.tokenId}
            collectionId={offer.collectionId}
            price={offer.price}
          />
        ))}
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
