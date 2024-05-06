import React, { VFC } from 'react';
import styled from 'styled-components';
import { Picture } from '../TokenMedia/Picture';

interface collectionCoverProps {
  src: string | undefined
  size: number
  type: 'circle' | 'square'
}

export const CollectionCover: VFC<collectionCoverProps> = ({ src, size = 24, type = 'circle' }) => {
  const testPictureUrl = (src?: string): string => {
    if (!src) return '';

    const baseUrl = 'https://ipfs.unique.network/ipfs/';
    const link = src.startsWith('https://') ? src : baseUrl + src;

    return link;
  };

  return (
    <CollectionCoverWrapper type={type} size={size}>
      <Picture src={testPictureUrl(src)} alt={'collection-cover'} size={size}/>
    </CollectionCoverWrapper>
  );
};

const CollectionCoverWrapper = styled.div<{ type: 'circle' | 'square', size: number }>`
  border-radius: ${({ type }) => type === 'circle' ? '50% 50%' : '4px'};
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  min-width: ${({ size }) => size}px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .picture {
    width: 100%;
    height: 100%;
    img {
      width: 100%;
      object-fit: cover;
    }
  }
`;
