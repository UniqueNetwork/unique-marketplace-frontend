import React, { FC } from 'react';
import { Icon, IconProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';

interface IconButtonProps extends IconProps {
  onClick(): void;
  className?: string;
  testid: string
}

export const IconButton: FC<IconButtonProps> = ({ onClick, className, testid, ...iconProps }) => {
  return (
    <StyledButton onClick={onClick} className={className} data-testid={`${testid}`}>
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
