import styled from 'styled-components';
import { EquippedWearables } from '../EquippedWearables';
import { Picture } from 'components';
import { WearablePicture } from 'components/TokenMedia/WearablePicture';
import { DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/schemas';
import { useEffect, useMemo } from 'react';
import { BREAKPOINTS } from 'hooks/useBreakpointObserver';
import { BadgeEnum } from 'components/TokenMedia/Picture';

interface SliderItem {
  src: string;
  // 'token_image' | 'image' | 'youtube_url' | 'video' | 'audio'
  type: string;
  isWearable?: boolean;
  baseSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  wearableSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  tokenId?: number;
  index: number;
  activeIndex: number;
  badges?: BadgeEnum[];
}

const SliderItem = styled.div`
  height: 100%;
`;

const Iframe = styled.iframe`
  width: calc(100% - 4px);
  margin: auto;
  border: none;
  height: 536px;

  @media (max-width: ${BREAKPOINTS.desktop}px) {
    height: 536px;
  }

  @media (max-width: ${BREAKPOINTS.smallDesktop}px) {
    height: 326px;
  }

  @media (max-width: ${BREAKPOINTS.tablet}px) {
    height: calc(100vw - var(--prop-gap) * 3);
  }

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    height: calc(100vw - var(--prop-gap) * 2);
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  // width: 100%;
  flex-direction: column;
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  div[class^='Skeleton'] {
    position: absolute;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 2px;
    bottom: 0;
    right: 2px;
    display: flex;
    align-items: center;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;

    img {
      max-width: 100%;
      max-height: 100%;
      border-radius: 8px;
    }

    svg {
      border-radius: 8px;
      height: auto;
    }
  }
`;

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const MainSliderItem = ({
  src,
  type,
  isWearable,
  wearableSrc,
  baseSrc,
  tokenId = 123,
  activeIndex,
  index,
  badges,
}: SliderItem) => {
  const isActive = useMemo(() => activeIndex === index, [activeIndex, index]);
  useEffect(() => {
    if (!isActive) {
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => video.pause());
    }
  }, [isActive]);

  switch (type) {
    case 'token_image':
      return (
        <PictureWrapper>
          {!isWearable ? (
            <Picture
              alt={tokenId?.toString() || ''}
              src={src}
              badges={badges}
            />
          ) : (
            <WearablePicture
              alt={tokenId?.toString() || ''}
              src={src}
              wearableSrc={wearableSrc || src}
              baseSrc={baseSrc}
            />
          )}
        </PictureWrapper>
      );
    case 'image':
      return (
        <PictureWrapper>
          <Picture
            alt={tokenId?.toString() || ''}
            src={src}
            badges={badges}
          />
        </PictureWrapper>
      );
    case 'youtube_url':
      return (
        <SliderItem>
          <Iframe
            src={src}
            title='YouTube video player'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          ></Iframe>
        </SliderItem>
      );
    case 'video':
      return (
        <PictureWrapper>
          <Picture
            alt={tokenId?.toString() || ''}
            src={''}
            video={src || ''}
            testid={`${`testid`}-token-picture`}
            // isPlaying={isActive}
          />
          <EquippedWearables />
        </PictureWrapper>
      );
    case 'audio':
      return (
        <SliderItem>
          <Picture alt={tokenId?.toString() || ''} src={''} video={src || ''} />
        </SliderItem>
      );
    default:
      return null;
  }
};

export default MainSliderItem;
