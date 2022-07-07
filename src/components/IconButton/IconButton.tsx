import React, { FC } from 'react';
import { Icon, IconProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';

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
  &:hover svg {
    fill: var(--color-primary-500);
  }
`;
