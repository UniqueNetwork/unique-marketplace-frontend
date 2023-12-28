import { Heading, Skeleton } from '@unique-nft/ui-kit';
import { MarketableCollection } from 'api/restApi/collections/types';
import { useTokens } from 'api/restApi/tokens/tokens';
import { Text } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { RoyaltiesFormData } from 'pages/CollectionEdit/types';
import { useState, useEffect, useMemo } from 'react';

import styled from 'styled-components';
import { formatAmount, formatBalance } from 'utils/textUtils';

export const CollectionStatisticsBlock = ({ collection, royalties }: { collection: MarketableCollection, royalties?: RoyaltiesFormData }) => {
  const { chainProperties } = useApi();
  const [currentFloorPrice, setCurrentFloorPrice] = useState<string>();
  const { fetch } = useTokens(collection);
  useEffect(() => {
    void (async () => {
      const result = await fetch({
        page: 1,
        pageSize: 1,
        saleType: 'OnSale',
        'sort[0]': ['asc(Price)']
      });
      setCurrentFloorPrice(result.items[0]?.price.parsed.toString());
    })();
  }, [collection, fetch]);

  const [floorPrice, floorPriceLabel] = useMemo(() => {
    if (currentFloorPrice) {
      return [`${currentFloorPrice} ${chainProperties?.token || ''}`, 'Current floor price'];
    }
    if (collection?.minPrice) {
      return [`${formatBalance(collection.minPrice)} ${chainProperties?.token || ''}`, 'Last sold price'];
    }
    return ['NO', 'floor price yet'];
  }, [currentFloorPrice, collection.minPrice, chainProperties?.token]);

  return <CollectionStatisticsBlockWrapper>
    <div>
      <Heading size='3'>{Math.max(collection.tokensCount, collection.tokensTotal || 0)}</Heading>
      <Text size={'m'} color='grey-600'>items</Text>
    </div>
    {collection.mode === 'NFT' && collection.tokensCount >= (collection.tokensTotal || 0) && <>
      <div>
        <Heading size='3'>{ (collection.tokensCount ? collection.tokensOnMarket / collection.tokensCount * 100 : 0).toFixed(0) }%</Heading>
        <Text size={'m'} color='grey-600'>listed NFTs</Text>
      </div>
      <div>
        <Heading size='3'>{floorPrice}</Heading>
        <Text size={'m'} color='grey-600'>{floorPriceLabel}</Text>
      </div>
      <div>
        <Heading size='3'>{collection.holders || 0}</Heading>
        <Text size={'m'} color='grey-600'>holders</Text>
      </div>
      <div>
        <Heading size='3'>{Number(collection.uniqueHolders !== 'NaN' ? collection.uniqueHolders : '0' || '0').toFixed(0)}%</Heading>
        <Text size={'m'} color='grey-600'>unique holders</Text>
      </div>
      {!!royalties?.royalties && <div>
        <Heading size='3'>{formatAmount(Number(royalties?.royalties.reduce((acc, { value }) => Number(acc) + Number(value), 0)))}%</Heading>
        <Text size={'m'} color='grey-600'>flexible royalties</Text>
      </div>}
    </>}
    {!!collection.tokensTotal && collection.tokensCount < collection.tokensTotal && <ProgressWrapper>
      <Heading size='4'>We are adding this collection to the marketplace right now, it may take a few minutes</Heading>
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
  height: 4px;
`;

const ProgressBar = styled.div<{ value: number }>`
  margin-top: -4px;
  height: 4px;
  width: ${({ value }) => (value * 100).toString() + '%'};
  background-color: var(--color-primary-500);
`;
