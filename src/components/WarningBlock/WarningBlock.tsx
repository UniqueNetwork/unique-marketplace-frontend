import React, { FC } from 'react';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { AdditionalWarning100 } from '../../styles/colors';

export const WarningBlock: FC = ({ children }) => {
  return (
    <WarningBlockWrapper>
      <Text
        color='additional-warning-500'
        size='s'
      >{children}</Text>
    </WarningBlockWrapper>
  );
};

const WarningBlockWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: calc(var(--gap) * 1.5) 0;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;
