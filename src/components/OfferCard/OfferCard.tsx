import React, { FC, useMemo, useRef } from 'react';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon, Text } from 'components/UI';
import { Offer } from 'api/restApi/offers/types';
import { formatBalance } from 'utils/textUtils';
import { countNestedChildren, stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { Primary600 } from 'styles/colors';
import { TokensMedia } from '../TokensCard/TokensMedia';
import { useApi } from '../../hooks/useApi';
import { BadgeEnum } from 'components/TokenMedia/Picture';
import { useCollections } from 'hooks/useCollections';
import { CollectionTitle } from './CollectionTitle';

export type TTokensCard = {
  offer: Offer
  testid: string
};

export const OfferCard: FC<TTokensCard> = ({ offer, testid }) => {
  const { currentChainId } = useApi();
  const { collectionIsCustomizable, collectionIsWearable } = useCollections();

  const {
    image,
    video,
    nestingChildTokens
  } = offer?.tokenDescription || {};

  const isBundle = !!nestingChildTokens?.length;

  const {
    tokenPrefix
  } = offer?.collectionDescription || {};

  const videoProp = useMemo(() => stringToDecodedInfixOrUrlOrCidAndHash(video), [video]);

  const tokenPath = useMemo(() => generatePath('/:currentChainId/token/:collectionId/:tokenId', {
    currentChainId: currentChainId || null,
    collectionId: offer?.collectionId.toString(),
    tokenId: offer?.tokenId.toString()
  }), [currentChainId, offer]);

  const collectionPath = useMemo(() => generatePath('/:currentChainId/collection/:collectionId', {
    currentChainId: currentChainId || null,
    collectionId: offer?.collectionId.toString()
  }), [currentChainId, offer]);

  const tokensCount = useMemo(() => {
    if (!isBundle) return 0;
    return countNestedChildren(nestingChildTokens);
  }, [nestingChildTokens]);

  const isCustomizable = useMemo(() => {
    if (!offer?.collectionId) {
      return;
    }
    return collectionIsCustomizable(offer?.collectionId) || collectionIsWearable(offer?.collectionId);
  }, [offer?.collectionId, collectionIsCustomizable, collectionIsWearable]);

  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <TokensCardStyled ref={cardRef} >
      <TokensMedia
        to={tokenPath}
        tokenId={offer?.tokenId}
        imageUrl={image}
        video={videoProp}
        testid={`${testid}-token-media`}
        badges={isCustomizable ? [BadgeEnum.Customizable] : []}
      />
      <Description>
        <BasicDataWrapper>
          <Link to={tokenPath} title={`${tokenPrefix || ''} #${offer?.tokenId}`} >
            <Text
              size='l'
              weight='regular'
              color={'secondary-500'}
              testid={`${testid}-tokenId`}
            >
              {`${tokenPrefix || ''} #${offer?.tokenId}`}
            </Text>
          </Link>
          <Link
            data-testid={`${testid}-collection-${offer?.collectionId}-link`}
            to={collectionPath}
          >
            <CollectionTitle
              collectionId={offer.collectionId}
              collectionName={offer.collectionDescription.name}
            />
          </Link>
        </BasicDataWrapper>
        <TradingInfoWrapper>
          <Text size={'xs'} color={'grey-500'} >Price</Text>
          <PriceWrapper length={offer.price.parsed.toFixed(5).length}>
            <Text
              testid={`${testid}-price`}
              size='l'
            >{formatBalance(offer.price.parsed, 4, true)}</Text>
            <IconStyled name={`chain-${currentChainId?.toLowerCase()}`} size={16} />
          </PriceWrapper>
        </TradingInfoWrapper>
      </Description>
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  background: #fff;
  border-radius: 8px;
  transition: transform 0.2s;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  cursor: pointer;
  padding: 12px 12px 8px 12px;

  &:hover {
    z-index: 10;
    transform: scale(1.05);
  }
`;

const BasicDataWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
`;

const PriceWrapper = styled.div<{ length: number }>` 
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: -4px;
  span:first-child {
    font-size: ${({ length }) => `${length > 11 ? 18 - (length - 11) : 18}px !important`}
  }
  span {
    white-space: nowrap;
  }
`;

const TradingInfoWrapper = styled.div` 
  display: flex;
  margin-top: calc(var(--gap) / 2);
  column-gap: calc(var(--gap) / 4);
  align-items: center;
  justify-content: space-between;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: calc(100% - 16px);
  span {
    color: ${Primary600};
  }
`;

const IconStyled = styled(Icon)`
  margin: 0 calc(var(--gap) / 4);
`;
