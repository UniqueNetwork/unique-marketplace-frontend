import React from 'react';
import { Text } from '@unique-nft/ui-kit';
import { Primary500 } from 'styles/colors';
import styled from 'styled-components';
import { Icon } from 'components/Icon/Icon';

function BuyBundleInformation({ testid }: { testid?: string }) {
  return (
    <Wrapper>
      <Text color={'additional-dark'} size={'m'} testid={`${testid}-buy-bundle-info`}>Buying a bundle, you will receive all its contents. </Text>
      <a href='#bundle'><Text color={'primary-500'} size={'m'} testid={`${testid}-buy-bundle-info`}>See what&#39;s inside</Text><Icon size={16} name={'arrow-down'} color={Primary500}></Icon></a>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: calc(var(--gap) * 1.5);
`;

export default BuyBundleInformation;
