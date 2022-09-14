import React, { FC } from 'react';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { AdditionalWarning100 } from '../../styles/colors';

export const WarningBlock: FC<{ margin?: number}> = ({ margin = 1.5, children }) => {
  return (
    <WarningBlockWrapper margin={margin}>
      <Text
        color='additional-warning-500'
        size='s'
      >{children}</Text>
    </WarningBlockWrapper>
  );
};

const WarningBlockWrapper = styled.div<{ margin: number }>`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: ${({ margin }) => `calc(var(--gap) * ${margin}) 0`};
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
  span {
    line-height: 22px !important;
  }
`;
