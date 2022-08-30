import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { BlueGrey100 } from '../styles/colors';
import Skeleton from './Skeleton/Skeleton';
import { VideoAttribute } from '../api/uniqueSdk/types';
import styled from 'styled-components';
import { DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';

interface VideoProps {
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
}

interface PictureProps {
  src?: string | DecodedInfixOrUrlOrCidAndHash
  alt: string
  testid?: string
  size?: number
  video?: VideoAttribute
  videoProps?: VideoProps
  isPlaying?: boolean
}

export const Picture: FC<PictureProps> = ({
  alt,
  src,
  size,
  testid = '',
  video,
  videoProps,
  isPlaying
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { autoplay = true, controls = true, loop = true, muted = true } = useMemo(() => videoProps || {}, [videoProps]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const imageUrl = src ? (typeof src === 'string' ? src.trim() : src.fullUrl) : '';
    if (!imageUrl) {
      setImageSrc(undefined);
      return;
    }

    const image = new Image();

    setIsLoading(true);

    image.onload = () => {
      setIsLoading(false);
      setImageSrc(imageUrl);
    };

    image.onerror = () => {
      setIsLoading(false);
    };

    image.src = imageUrl;
  }, [src]);

  useEffect(() => {
    if (isPlaying && videoRef.current?.paused) {
      void videoRef.current.play();
    } else if (!isPlaying && !videoRef.current?.paused) {
      void videoRef.current?.pause();
    }
  }, [isPlaying]);

  const videoUrl = useMemo(() => {
    if (!video) return undefined;
    const url = video.fullUrl || video.url;
    // if video doesn't have poster, we rewind video to 0.001 sec
    // because iphone doesn't render first frame as a poster https://developer.apple.com/forums/thread/129377
    if (!imageSrc) return `${url}#t=0.001`;
    else return url;
  }, [video, imageSrc]);

  return (<div className={'picture'}>
    {isLoading && <Skeleton width={'100%'} height={'100%'} />}
    {!isLoading && video &&
      <VideoStyled
        ref={videoRef}
        src={videoUrl}
        poster={imageSrc || undefined}
        controls={controls}
        autoPlay={autoplay}
        playsInline
        loop={loop}
        muted={muted}
        data-testid={`${testid}-video`}
      ></VideoStyled>
    }
    {!isLoading && imageSrc && !video &&
      <img
        alt={alt}
        src={imageSrc}
        height={size || undefined}
        data-testid={`${testid}`}
      />}
    {!isLoading && !imageSrc && !video && <svg
      fill={'white'}
      height='100%'
      viewBox='0 0 1000 1000'
      width='100%'
    >
      <rect
        fill={BlueGrey100}
        height={1000}
        width={1000}
        x={0}
        y={0}
      />
      <g transform={`translate(500.000000,500.000000) scale(${size ? size / 2 : 3.2},${size ? size / 2 : 3.2})`}>
        <g transform='translate(-32.000000,-32.000000)'>
          <path fillRule='evenodd'
            clipRule='evenodd'
            d='M6 14.6665C6 12.4574 7.79086 10.6665 10 10.6665H54C56.2091 10.6665 58 12.4574 58 14.6665V50.6665C58 52.8756 56.2091 54.6665 54 54.6665H10C7.79086 54.6665 6 52.8756 6 50.6665V14.6665ZM54 14.6665H10V50.6665H54V14.6665Z'
            fill='#9CAAB7'
          />
          <path fillRule='evenodd'
            clipRule='evenodd'
            d='M20.4692 25.6375C20.9545 25.4365 21.4747 25.333 22 25.333C22.5253 25.333 23.0454 25.4365 23.5307 25.6375C24.016 25.8385 24.457 26.1332 24.8284 26.5046L36 37.6762L41.1715 32.5046C41.543 32.1331 41.9839 31.8385 42.4692 31.6375C42.9545 31.4365 43.4747 31.333 44 31.333C44.5252 31.333 45.0454 31.4365 45.5307 31.6375C46.016 31.8385 46.457 32.1331 46.8284 32.5046L57.4142 43.0904C57.7892 43.4654 58 43.9742 58 44.5046V50.5046C58 51.6091 57.1045 52.5046 56 52.5046H8C6.89543 52.5046 6 51.6091 6 50.5046V40.5045C6 39.9741 6.21071 39.4654 6.58579 39.0903L19.1715 26.5046C19.543 26.1332 19.9839 25.8385 20.4692 25.6375ZM10 41.333V51.4163H54V45.333L44 35.333L38.8284 40.5046C38.457 40.876 38.016 41.1707 37.5307 41.3717C37.0454 41.5727 36.5252 41.6762 36 41.6762C35.4747 41.6762 34.9545 41.5727 34.4692 41.3717C33.9839 41.1707 33.543 40.876 33.1715 40.5046L22 29.333L10 41.333Z'
            fill='#9CAAB7'
          />
          <path d='M39 28C40.6569 28 42 26.6569 42 25C42 23.3431 40.6569 22 39 22C37.3431 22 36 23.3431 36 25C36 26.6569 37.3431 28 39 28Z' fill='#9CAAB7'/>
        </g>
      </g>
      </svg>
    }
  </div>);
};

const VideoStyled = styled.video`
  width: 100%;
  @media (min-width: 1920px) {
    height: 536px;
  }
  @media (max-width: 767px) {
    height: 100%;
  }
`;
