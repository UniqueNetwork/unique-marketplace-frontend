import React, { FC } from 'react';
import { IconProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { Icon } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

interface IconButtonProps extends IconProps {
  onClick(): void;
}

export const IconButton: FC<IconButtonProps> = ({ onClick, ...iconProps }) => {
  return (
    <StyledButton onClick={onClick}>
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
