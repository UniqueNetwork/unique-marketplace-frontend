import { FC } from 'react';
import styled from 'styled-components/macro';

export interface IAvatarProps {
  src: string;
  size: number;
  type?: 'circle' | 'square';
}

export const Avatar: FC<IAvatarProps> = ({
  size = 38,
  src,
  type = 'square'
}: IAvatarProps) => <AvatarWrapper size={size}>
  <AvatarStyled $type={type}
    src={src}
    height={size}
  />
</AvatarWrapper>;

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
`;
