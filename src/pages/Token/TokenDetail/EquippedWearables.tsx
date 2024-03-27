import { useContext, useMemo } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { TokensCard } from 'components';
import styled from 'styled-components';
import { Heading } from 'components/UI';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { TokenContext } from '../context/TokenContext';
import Skeleton from 'components/Skeleton/Skeleton';

export const EquippedWearables = () => {
  const { bundle, isFetching } = useContext(TokenContext);

  const deviceSize = useDeviceSize();

  const tokensPerSlide = useMemo(() => {
    switch (deviceSize) {
      case DeviceSize.sm: return 2;
      case DeviceSize.md: return 2;
      case DeviceSize.lg: return 4;
      default: return 4;
    }
  }, [deviceSize]);

  const slides = useMemo(() => {
    if (!bundle?.children?.length) return [];
    const slidesCount = Math.ceil(bundle.children.length / tokensPerSlide);
    const slides = bundle.children.length <= 8
      ? [bundle.children]
      : Array.from({ length: slidesCount })
    .map((_, index) => bundle.children.slice(index * tokensPerSlide, index * tokensPerSlide + tokensPerSlide));

    return slides.map((tokens, index) => {
        return <SlideWrapper key={index}>
          {tokens.map((token) => {
            return (
              <TokensCard
                key={`${token.collectionId}_${token.tokenId}`}
                collectionId={token.collectionId}
                tokenId={token.tokenId}
                showCollectionLink={false}
                testid={''}
              />
            );
          })}
        </SlideWrapper>;
      });
  }, [tokensPerSlide, bundle]);

  if (isFetching) return (<BundleIsLoading />);

  if (!bundle?.children?.length) return null;

  return <EquippedWearablesWrapper>
    <HeaderStyled>
      <Heading size={'3'}>NFT Wearables</Heading>
    </HeaderStyled>
    <Slide
      autoplay={false}
      transitionDuration={150}
      infinite={true}
      arrows={bundle.children.length > 8 && bundle.children.length > tokensPerSlide}
    >
      {slides}
    </Slide>
  </EquippedWearablesWrapper>;
};

const SlideWrapper = styled.div`
  display: flex;
  width: calc(536px + 32px);
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  flex-wrap: wrap;
  &>div {
    width: calc(25% - 36px);
    @media (max-width: 1023px) {
      width: calc(50% - 36px);
    }
    span.token-title {
      display: flex;
      flex-direction: column;
    }
  }
  @media (max-width: 1023px) {
    width: calc(326px + 32px);
  }

  @media (max-width: 767px) {
    width: calc(100vw - var(--gap) * 3);
  }

  @media (max-width: 567px) {
    width: calc(100vw - var(--gap) * 2);
  }

`;

const EquippedWearablesWrapper = styled.div`
  margin-top: 16px;
  width: 100%;
  div[aria-roledescription="carousel"] {
    margin: 0 -16px;
    @media (max-width: 767px) {
      margin: 0;
    }
  }
  div.images-wrap {
    flex-wrap: nowrap !important;
    width: auto !important;

    &>div {
      display: block !important;
    }
  }
  button.nav {
    width: 24px;
    height: 24px;
    &>svg {
      width: 24px;
      height: 24px;
    }

    @media (max-width: 1023px) {    
      width: 16px;
      height: 16px;
      &>svg {
        width: 16px;
        height: 16px;
      }
    }
  }
  button.nav[data-type=prev] {
    margin-left: -12px;
    @media (max-width: 1023px) {    
      margin-left: -8px;
    }
  }
  button.nav[data-type=next] {
    margin-right: -12px;
    @media (max-width: 1023px) {    
      margin-right: -8px;
    }
  }
`;

const HeaderStyled = styled.div`
  display: flex;
  gap: var(--gap);
  & > h3.unique-font-heading.size-3 {
    padding-top: 12px;
    margin-bottom: 0px;
  }
`;

const BundleIsLoading = () => (<>
  <HeaderStyled>
    <Heading size={'2'}>NFT Wearables</Heading>
  </HeaderStyled>
  <Skeleton height={60} width={'100%'} />
</>);
