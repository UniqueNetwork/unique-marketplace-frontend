import { Offer } from 'api/restApi/offers/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockWearables } from './constants';
import { useApi } from 'hooks/useApi';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { TokensCard } from 'components';
import { MyToken } from 'pages/MyTokens/types';
import { useOffers } from 'api/restApi/offers/offers';
import styled from 'styled-components';
import { Button, Heading } from '@unique-nft/ui-kit';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { useNavigate } from 'react-router-dom';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

interface IProps {
  offer?: Offer | undefined
  collection?: CollectionInfoWithSchemaResponse
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
          collectionId: collection?.id,
          page: 1,
          pageSize: 40
        });

        setTokens(items);
      }
    })();
  }, [baseCollection, wearableCollections, fetch, collection?.id]);

  const onExploreCollectionClick = useCallback(() => {
    if (baseCollection) {
      navigate(`/${currentChainId}/collection/${baseCollection}/`);
      return;
    }
    if (wearableCollections?.length === 1) {
      navigate(`/${currentChainId}/collection/${wearableCollections[0]}/`);
    }
    if (wearableCollections && wearableCollections?.length > 1) {
      navigate(`/${currentChainId}/market?filterState={"attributeCounts":[],"collections":[${wearableCollections.join(',')}],"attributes":[]}`);
    }
  }, [baseCollection, wearableCollections, navigate, currentChainId]);

  const deviceSize = useDeviceSize();

  const slidesToShow = useMemo(() => {
    switch (deviceSize) {
      case DeviceSize.sm: return 3;
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
  width: calc(100vw - 128px);
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  justify-content: center;
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
    /* padding: 16px 0;
    &>div {
      padding: 0 16px;
      flex: 20%;
      max-width: 20%;
      @media (max-width: 768px) {
        flex: 50%;
        max-width: 50%;
      }
      @media (max-width: 1024px) {
        flex: 33.33%;
        max-width: 33.33%;
      }
      @media (max-width: 1279px) {
        flex: 25%;
        max-width: 25%;
      }
    }
    &>div>div{
      padding: 0 8px;
    } */
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
