import React, { FC, useCallback, useState } from 'react';
import { BlueGrey200, BlueGrey500, BlueGrey100, BlueGrey300 } from 'styles/colors';
import { VideoAttribute } from 'api/uniqueSdk/types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import playIcon from 'static/icons/play.svg';
import pauseIcon from 'static/icons/pause.svg';
import { Picture } from '../Picture';
import { DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';

interface ITokensMedia {
  to: string
  tokenId?: number
  imageUrl?: string | DecodedInfixOrUrlOrCidAndHash
  video?: VideoAttribute
  testid: string
}

export const TokensMedia: FC<ITokensMedia> = ({ to, imageUrl, tokenId, video, testid }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <PictureWrapper to={to} isPlaying={isPlaying}>
      <Picture
        alt={tokenId?.toString() || ''}
        src={imageUrl}
        video={video}
        testid={`${testid}-token-picture`}
        videoProps={{ autoplay: false, controls: false }}
        isPlaying={isPlaying}
      />
      {video &&
        <div className={'play-button'} onClick={togglePlay}>
          <img src={isPlaying ? pauseIcon : playIcon} alt='icon' />
        </div>
      }
    </PictureWrapper>
  );
};

const PictureWrapper = styled(Link)<{ isPlaying: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;
    transition: 50ms;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }
    
    video {
      height: 100% !important;
      width: 100% !important;
    }
  }
  
  .play-button {
    align-items: center;
    border-radius: 50%;
    display: flex;
    height: 54px;
    justify-content: center;
    bottom: 8px;
    right: 8px;
    width: 54px;
    z-index: 1;
    position: absolute;
    background-color: #FFFFFF;
    backdrop-filter: blur(8px);
    border: 1px solid ${BlueGrey200};
    cursor: pointer;
    img {
      width: 24px;
      height: 24px;
      margin-left: ${({ isPlaying }) => (isPlaying ? '0' : '4px')};
    }
  }
  
  @media (max-width: 768px) {
    .play-button {
      height: 64px;
      width: 64px;
      img {
        width: 22px;
        height: 26px;
      }
    }
  }

  &:hover .picture {
    transform: ${({ isPlaying }) => (!isPlaying && 'translate(0, -5px)')};
    text-decoration: none;
  }
  
  .play-button:hover {
    background-color: ${BlueGrey100};
    border: 1px solid ${BlueGrey300};
  }
  
  .play-button:active {
    border: 1px solid ${BlueGrey500};
  }
`;
