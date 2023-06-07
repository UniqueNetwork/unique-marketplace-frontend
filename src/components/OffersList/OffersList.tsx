import { FC } from 'react';
import styled from 'styled-components';
import { Offer } from '../../api/restApi/offers/types';
import { OfferCard } from '../OfferCard/OfferCard';
import CardSkeleton from '../Skeleton/CardSkeleton';

type TTokensList = {
  offers: Offer[]
  isLoading?: boolean
  testid: string
};

export const OffersList: FC<TTokensList> = ({ offers, isLoading, testid }) => {
  return (
    <OffersListStyled>
      {offers?.map &&
        offers.map((offer: Offer) => (
          <OfferCard
            key={`token-${offer.collectionId}-${offer.tokenId}`}
            offer={offer}
            testid={`${testid}-card`}
          />
        ))}
      {isLoading && <>
        {Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={`card-skeleton-${index}`} />)}
      </>}
    </OffersListStyled>
  );
};

const OffersListStyled = styled.div`
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
