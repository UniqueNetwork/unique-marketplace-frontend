import React from 'react';
import { Text } from '@unique-nft/ui-kit';
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
  margin-top: calc(var(--gap) / 2);
`;

export default BundleItemsCount;
