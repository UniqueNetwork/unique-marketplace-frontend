import { FC } from 'react';
import Identicon from '@polkadot/react-identicon';
import styled from 'styled-components';
import { DecodedInfixOrUrlOrCidAndHash } from 'api/chainApi/types';
import { Address } from '@unique-nft/utils';

export interface IAvatarProps {
  src?: string | DecodedInfixOrUrlOrCidAndHash;
  address?: string;
  size: number;
  type?: 'circle' | 'square';
  testid?: string
  video?: string | DecodedInfixOrUrlOrCidAndHash;
}

export const Avatar: FC<IAvatarProps> = ({
  src,
  address,
  type = 'square',
  size = 38,
  testid,
  video
}: IAvatarProps) => {
  const imgUrl = typeof src === 'string' ? src : (src?.fullUrl);
  const videoUrl = typeof video === 'string' ? video : (video?.fullUrl);

  if (address) {
    // Polkadot doesn't degenerate images for ETH address. Therefore - for metamask we will use substrate mirror instead
    const IdentIconAddress = Address.is.ethereumAddress(address) ? Address.mirror.ethereumToSubstrate(address) : address;
    return <Identicon
      value={IdentIconAddress}
      size={size}
    />;
  }

  if (videoUrl && imgUrl?.endsWith('/ipfs/')) {
    return <AvatarWrapper size={size}>
      <video
        src={videoUrl}
        controls={false}
        autoPlay={false}
        playsInline
        loop={false}
        data-testid={`${testid}-video`}
      />
    </AvatarWrapper>;
  }

  return <AvatarWrapper size={size}>
    <AvatarStyled $type={type}
      src={imgUrl || ''}
      height={size}
      alt={''}
      data-testid={testid}
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
  video {
    width: 100%;
  }
`;

const AvatarStyled = styled.img<{ $type: 'circle' | 'square' }>`
  border-radius: ${(props) => (props.$type === 'circle' ? '50%' : '4px')};
  outline: ${(props) =>
    props.$type === 'circle' ? '1px solid $color-grey-200' : 'none'};
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
`;
