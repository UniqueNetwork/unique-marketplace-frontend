import React from 'react';
import { Text } from 'components/UI';
import styled from 'styled-components';

function BundleItemsCount({ count, testId }: { count: number, testId: string }) {
  return (
    <Wrapper>
      <Text
        testid={`${testId}-bundle-items`}
        size={'s'}
        color={'grey-500'}
      >Nested items: </Text>
      <Text
        testid={`${testId}-bundle-items`}
        size={'s'}
        color={'additional-dark'}
      >{count || ''}</Text>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: calc(var(--prop-gap) / 2);
`;

export default BundleItemsCount;
