import { useCallback, useEffect, useMemo, useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import styled from 'styled-components';

import { Offer } from 'api/restApi/offers/types';
import { useOffers } from 'api/restApi/offers/offers';
import { useApi } from 'hooks/useApi';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

import { TokensCard } from 'components';
import { MyToken } from 'pages/MyTokens/types';
import { CollectionWithInfoV2Dto } from '@unique-nft/sdk';
import { useNavigate } from 'react-router-dom';
import { mockWearables } from './constants';
import { Button, Heading } from 'components/UI';

interface IProps {
  offer?: Offer | undefined
  collection?: CollectionWithInfoV2Dto
}

export const RecommendationSection = ({ offer, collection }: IProps) => {
  const [tokens, setTokens] = useState<(Offer | MyToken)[]>([]);
  const collectionId = offer?.collectionId;
  const { currentChainId } = useApi();
  const { fetch, isFetching } = useOffers();
  const navigate = useNavigate();

  const wearableCollections = useMemo(() => {
    if (collection?.properties?.find(({ key }) => key === 'is_customizable')?.value) {
      return collection?.permissions?.nesting?.restricted;
    }
    return [];
  }, [collection]);

  const baseCollection = useMemo(() => {
    return mockWearables[currentChainId || '']?.find((item) => collectionId === item.collectionId)?.baseCollections[0];
  }, [collectionId, currentChainId]);

  useEffect(() => {
    void (async () => {
      if (baseCollection) {
        const { items } = await fetch({
          collectionId: baseCollection,
          page: 1,
          pageSize: 40
        });
        setTokens(items);
      } else if (wearableCollections?.length) {
        const { items } = await fetch({
          collectionId: wearableCollections,
          page: 1,
          pageSize: 40
        });
        setTokens(items);
      } else if (collection) {
        const { items } = await fetch({
          collectionId: collection?.collectionId,
          page: 1,
          pageSize: 40
        });

        setTokens(items);
      }
    })();
  }, [baseCollection, wearableCollections, fetch, collection?.collectionId]);

  const onExploreCollectionClick = useCallback(() => {
    if (baseCollection) {
      navigate(`/${currentChainId}/collection/${baseCollection}/`);
      return;
    }
    if (wearableCollections?.length === 1) {
      navigate(`/${currentChainId}/collection/${wearableCollections[0]}/`);
      return;
    }
    if (wearableCollections && wearableCollections?.length > 1) {
      navigate(`/${currentChainId}/market?filterState={"attributeCounts":[],"collections":[${wearableCollections.join(',')}],"attributes":[]}`);
      return;
    }
    navigate(`/${currentChainId}/collection/${collection?.collectionId}/`);
  }, [baseCollection, wearableCollections, navigate, currentChainId, collection]);

  const deviceSize = useDeviceSize();

  const slidesToShow = useMemo(() => {
    switch (deviceSize) {
      case DeviceSize.sm: return 2;
      case DeviceSize.md: return 3;
      case DeviceSize.lg: return 5;
      default: return 5;
    }
  }, [deviceSize]);

  const slides = useMemo(() => {
    const slidesCount = Math.ceil(Math.min(tokens.length, 20) / slidesToShow);
    const slides = Array.from({ length: slidesCount })
    .map((_, index) => tokens.slice(index * slidesToShow, index * slidesToShow + slidesToShow));

    return slides.map((tokens, index) => {
        return <SlideWrapper key={index}>
          {tokens.map((token) => {
            return (
              <TokensCard
                key={`${token.collectionId}_${token.tokenId}`}
                collectionId={token.collectionId}
                tokenId={token.tokenId}
                offer={token}
                testid={''}
              />
            );
          })}
        </SlideWrapper>;
      });
  }, [slidesToShow, tokens]);

  if (!offer || isFetching) return null;

  return <RecommendationWrapper>
    <Heading size='2' >{baseCollection ? 'Base NFTs for this collection' : (wearableCollections?.length ? 'NFT Wearables for this collection' : 'More NFTs from this collection')}</Heading>
    <Slide
      autoplay={false}
      transitionDuration={150}
      infinite={true}
      arrows={tokens.length > slidesToShow}
    >
      {slides}
    </Slide>
    <ActionWrapper>
      <Button title={wearableCollections && wearableCollections?.length > 1 ? 'More info' : 'Explore collection'} onClick={onExploreCollectionClick} />
    </ActionWrapper>
  </RecommendationWrapper>;
};

const SlideWrapper = styled.div`
  display: flex;
  width: calc(100vw - 160px);
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  justify-content: center;
  &>div {
    flex: auto;
    max-width: 20%;
    @media (max-width: 1024px) {
      max-width: 33.33%;
    }
    @media (max-width: 768px) {
      max-width: 50%;
    }
  }
  @media (max-width: 1440px) {
    width: calc(100vw - 128px);
  }
  @media (max-width: 1024px) {
    width: calc(100vw - 64px);
  }
  @media (max-width: 620px) {
    width: calc(100vw - 32px);
  }

`;

const RecommendationWrapper = styled.div`
  margin-top: 32px;
  width: 100%;
  div.images-wrap {
    flex-wrap: nowrap !important;
    width: auto !important;

    &>div {
      display: block !important;
    }
  }
  button.nav[data-type=prev] {
    margin-left: -24px;
  }
  button.nav[data-type=next] {
    margin-right: -24px;
  }
`;

const ActionWrapper = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: center;
`;
