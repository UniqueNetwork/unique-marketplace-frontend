import React, { FC } from 'react';
import styled from 'styled-components';
import { Primary100 } from '../../styles/colors';
import { Text } from 'components/UI';

export const WarningBlock: FC<{ margin?: number, testid?: string }> = ({ margin = 1.5, children, testid }) => {
  return (
    <WarningBlockWrapper margin={margin}>
      <Text
        color='primary-500'
        size='s'
        testid={testid}
      >{children}</Text>
    </WarningBlockWrapper>
  );
};

const WarningBlockWrapper = styled.div<{ margin: number }>`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: ${({ margin }) => `calc(var(--prop-gap) * ${margin}) 0`};
  border-radius: 4px;
  background-color: ${Primary100};
  width: 100%;
  span {
    line-height: 22px !important;
  }
`;
