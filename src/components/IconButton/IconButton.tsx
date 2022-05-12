import React, { FC } from 'react';
import { IconProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { Icon } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

interface IconButtonProps extends IconProps {
  onClick(): void;
  className?: string;
}

export const IconButton: FC<IconButtonProps> = ({ onClick, className, ...iconProps }) => {
  return (
    <StyledButton onClick={onClick} className={className}>
      <Icon {...iconProps} />
    </StyledButton>
  );
};

const StyledButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
`;
