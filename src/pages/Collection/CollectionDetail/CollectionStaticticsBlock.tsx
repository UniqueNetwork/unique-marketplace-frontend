import { Heading } from '@unique-nft/ui-kit';
import { Text } from 'components/UI';

import styled from 'styled-components';

export const CollectionStatisticsBlock = () => {
  return <CollectionStatisticsBlockWrapper>
    <div>
      <Heading size='3'>10 000</Heading>
      <Text size={'m'} color='grey-600'>items</Text>
    </div>
    <div>
      <Heading size='3'>77.1%</Heading>
      <Text size={'m'} color='grey-600'>listed NFTs</Text>
    </div>
    <div>
      <Heading size='3'>1 KSM</Heading>
      <Text size={'m'} color='grey-600'>floor price</Text>
    </div>
    <div>
      <Heading size='3'>7 582</Heading>
      <Text size={'m'} color='grey-600'>holders</Text>
    </div>
    <div>
      <Heading size='3'>74%</Heading>
      <Text size={'m'} color='grey-600'>unique holders</Text>
    </div>
  </CollectionStatisticsBlockWrapper>;
};

const CollectionStatisticsBlockWrapper = styled.div`
  display: flex;
  margin-top: calc(var(--gap) / 2);
  & > div {
    display: flex;
    flex-direction: column;
    padding-right: calc(var(--gap) * 1.5);
    margin-right: calc(var(--gap) * 1.5);
    border-right: 1px solid var(--color-blue-grey-200);
    & > h4.unique-font-heading.size-4 {
      margin-bottom: calc(var(--gap) / 4) ;
    }
    span.color-grey-600 {
      color: var(--color-grey-600);
    }
  }
  @media (max-width: 1024px) {
    & > div {
      padding-right: calc(var(--gap) * 1);
      margin-right: calc(var(--gap) * 1);
    }
  }
  @media (max-width: 576px) {
    flex-direction: column;
    & > div {
      flex-direction: row;
      gap: calc(var(--gap) / 2);
      align-items: baseline;
    }
  }
  & > div:last-child {
    border: none;
    padding-right: 0;
    margin-right: 0;
  }
`;
