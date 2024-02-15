import React, { FC, useCallback, useMemo, useState } from 'react';
import Skeleton from '../Skeleton/Skeleton';
import { DecodedInfixOrUrlOrCidAndHash } from 'api/chainApi/types';
import styled from 'styled-components';
import { Placeholder } from './Placeholder';
import { Button } from 'components/UI';

interface PictureProps {
  src?: string | DecodedInfixOrUrlOrCidAndHash;
  baseSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  wearableSrc?: string | DecodedInfixOrUrlOrCidAndHash;
  alt: string;
  testid?: string;
  size?: number;
}

export const WearablePicture: FC<PictureProps> = ({
  alt,
  src,
  wearableSrc,
  baseSrc,
  size,
  testid = ''
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [tryMode, setTryMode] = useState<boolean>(false);

  const onTryOnClick = useCallback(() => {
    setTryMode(!tryMode);
  }, [tryMode]);

  return (<div className={'picture'}>
    <ImgStyled
      visible={!!baseSrc && tryMode}
      alt={alt}
      src={getUrl(baseSrc)}
      height={size || undefined}
      data-testid={`${testid}`}
    />
    <ImgStyled
      visible={!!baseSrc && tryMode}
      alt={alt}
      src={getUrl(wearableSrc)}
      height={size || undefined}
      data-testid={`${testid}`}
    />
    {!hasError && src &&
      <ImgStyled
        visible={!isLoading && !tryMode}
        alt={alt}
        src={getUrl(src)}
        height={size || undefined}
        data-testid={`${testid}`}
        loading='lazy'
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />}
    {!isLoading && (hasError || !src || !baseSrc) && <Placeholder size={size} />}
    {!isLoading && !hasError && baseSrc && <ActionsWrapper>
      <Button onClick={onTryOnClick} title={tryMode ? 'Wearable' : 'Try on'} />
    </ActionsWrapper>}
    {isLoading && <Skeleton width={'100%'} height={'100%'} />}
  </div>);
};

const ImgStyled = styled.img<{ visible: boolean }>`
  display: ${({ visible }) => visible ? 'block' : 'none'};
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ActionsWrapper = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
`;

const getUrl = (src?: string | DecodedInfixOrUrlOrCidAndHash) => src ? (typeof src === 'string' ? src.trim() : (src.fullUrl || '')) : '';
