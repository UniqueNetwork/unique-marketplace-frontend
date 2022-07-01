import React, { FC, useEffect, useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import styled from 'styled-components';
import { Icon } from '@unique-nft/ui-kit';

export interface IAvatarProps {
  src?: string;
  address?: string;
  size: number;
  type?: 'circle' | 'square';
}

export const Avatar: FC<IAvatarProps> = ({
  size = 38,
  src,
  address,
  type = 'square'
}: IAvatarProps) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!src || address) return;

    const image = new Image();

    image.onload = () => {
      setImageSrc(src);
    };

    image.src = src;
  }, [src]);

  if (address) {
    return <Identicon
      value={address}
      size={size}
    />;
  }

  if (!imageSrc) {
    return <Icon name='empty-image' size={size} />;
  }

  return <AvatarWrapper size={size}>
    <AvatarStyled $type={type}
      src={imageSrc}
      height={size}
    />
  </AvatarWrapper>;
};

const AvatarWrapper = styled.div<{ size: number }>`
  overflow: hidden;
  height: ${({ size }) => `${size}px`};
  width: ${({ size }) => `${size}px`};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarStyled = styled.img<{ $type: 'circle' | 'square' }>`
  border-radius: ${(props) => (props.$type === 'circle' ? '50%' : '4px')};
  outline: ${(props) =>
    props.$type === 'circle' ? '1px solid $color-grey-200' : 'none'};
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
`;
