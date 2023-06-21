import { Heading, Skeleton } from '@unique-nft/ui-kit';
import { MarketableCollection } from 'api/restApi/collections/types';
import { Text } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { RoyaltiesFormData } from 'pages/CollectionEdit/types';

import styled from 'styled-components';
import { formatAmount, formatBalance } from 'utils/textUtils';

export const CollectionStatisticsBlock = ({ collection, royalty }: { collection: MarketableCollection, royalty?: RoyaltiesFormData }) => {
  const { chainProperties } = useApi();
  return <CollectionStatisticsBlockWrapper>
    <div>
      <Heading size='3'>{Math.max(collection.tokensCount, collection.tokensTotal || 0)}</Heading>
      <Text size={'m'} color='grey-600'>items</Text>
    </div>
    {collection.tokensCount >= (collection.tokensTotal || 0) && <>
      <div>
        <Heading size='3'>{ (collection.tokensCount ? collection.tokensOnMarket / collection.tokensCount * 100 : 0).toFixed(0) }%</Heading>
        <Text size={'m'} color='grey-600'>listed NFTs</Text>
      </div>
      <div>
        <Heading size='3'>{formatBalance(collection.minPrice || 0)} {chainProperties?.token || ''}</Heading>
        <Text size={'m'} color='grey-600'>floor price</Text>
      </div>
      <div>
        <Heading size='3'>{collection.holders || 0}</Heading>
        <Text size={'m'} color='grey-600'>holders</Text>
      </div>
      <div>
        <Heading size='3'>{Number(collection.uniqueHolders !== 'NaN' ? collection.uniqueHolders : '0' || '0').toFixed(0)}%</Heading>
        <Text size={'m'} color='grey-600'>unique holders</Text>
      </div>
      {!!royalty?.value && <div>
        <Heading size='3'>{formatAmount(Number(royalty.value))}%</Heading>
        <Text size={'m'} color='grey-600'>flexible royalties</Text>
      </div>}
    </>}
    {!!collection.tokensTotal && collection.tokensCount < collection.tokensTotal && <ProgressWrapper>
      <Heading size='3'>Scanning...</Heading>
      <Text size='m' color='grey-600'>Scanned {collection.tokensCount} of {collection.tokensTotal} tokens</Text>
      <ProgressBarWrapper>
        <Skeleton />
        <ProgressBar value={collection.tokensCount / collection.tokensTotal} />
      </ProgressBarWrapper>
    </ProgressWrapper>}
  </CollectionStatisticsBlockWrapper>;
};

const CollectionStatisticsBlockWrapper = styled.div`
  display: flex;
  margin-top: calc(var(--gap) / 2);
  margin-right: calc(var(--gap) / 2);
  & > div {
    display: flex;
    flex-direction: column;
    padding-right: calc(var(--gap) * 1.5);
    margin-right: calc(var(--gap) * 1.5);
    border-right: 1px solid var(--color-blue-grey-200);
    & > h3.unique-font-heading {
      margin-bottom: calc(var(--gap) / 4) ;
    }
    span.color-grey-600 {
      color: var(--color-grey-600);
    }
  }
  @media (max-width: 1024px) {
    margin-right: 0;
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
      border-right: none;
    }
  }
  & > div:last-child {
    border: none;
    padding-right: 0;
    margin-right: 0;
  }
`;

const ProgressWrapper = styled.div`
  &&{
    display: flex;
    flex-direction: column;
    flex: 1;
    @media (max-width: 576px) {
      flex-direction: column;
      gap: 0;
    }
  }

`;

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  height: 8px;
  gap: calc(var(--gap) / 2);
`;

const ProgressBar = styled.div<{ value: number }>`
  margin-top: -8px;
  height: 8px;
  width: ${({ value }) => (value * 100).toString() + '%'};
  background-color: var(--color-primary-500);
`;
