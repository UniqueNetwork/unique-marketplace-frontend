import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { Select } from 'components/UI';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

import { TokensList } from 'components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import NoItems from 'components/NoItems';
import SearchField from 'components/SearchField/SearchField';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { useCollections } from 'hooks/useCollections';

import { MobileFilters } from './Filters/MobileFilter';
import { Filters } from './Filters/Filters';
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { useParams } from 'react-router-dom';
import { CollectionDetail } from './CollectionDetail/CollectionDetail';
import { useTokens } from 'api/restApi/tokens/tokens';
import { useMarketFilter } from 'pages/Market/hooks/useMarketFilter';
import InfiniteScroll from 'react-infinite-scroller';

export const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse>();
  const deviceSize = useDeviceSize();
  const { getCollection, isFetching: isFetchingCollection } = useCollections();

  const { tokens, tokensCount, isFetching, fetchMore, fetch, attributes, attributeCounts } = useTokens({
    collectionId: Number(collectionId)
  });
  const { currentChainId } = useApi();

  const {
    filterState,
    searchValue,
    sortingValue,
    filterCount,
    onFilterChange,
    onSearch,
    onSortingChange,
    getFilterByState
   } = useMarketFilter({ isFetching, fetch });

  useEffect(() => {
    if (!selectedAccount?.address || isAccountsLoading) return;

    void (async () => {
      const collection = await getCollection(Number(collectionId));
      if (!collection) return; // TODO redirect to 404
      setCollection(collection);
    })();
  }, [currentChainId, collectionId, fetch, selectedAccount?.address, getCollection]);

  const hasMore = tokens && tokens.length < tokensCount;

  const onClickSeeMore = useCallback(() => {
    if (!isFetching) {
      void fetchMore({
        page: Math.ceil(tokens.length / pageSize) + 1,
        pageSize,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        sort: [sortingValue]
      });
    }
  }, [fetchMore, tokens, pageSize, isFetching, searchValue, filterState]);

  return (<>
    <CollectionDetail collection={collection} />
    <CollectionPagePaper>
      <MarketMainPageStyled>
        <LeftColumn>
          {deviceSize !== DeviceSize.md && <Filters
            value={filterState}
            attributes={attributes}
            attributeCounts={attributeCounts}
            onFilterChange={onFilterChange}
            testid={`${testid}-filters`}
          />}
        </LeftColumn>
        <MainContent>
          <SearchAndSortingWrapper>
            <SearchField
              searchValue={searchValue}
              placeholder='Token / attribute'
              onSearch={onSearch}
              testid={`${testid}-search-field`}
            />
            <SortSelectWrapper>
              <Select
                onChange={onSortingChange}
                options={sortingOptions}
                value={sortingValue}
                testid={`${testid}-sorting-select`}
              />
            </SortSelectWrapper>
          </SearchAndSortingWrapper>
          <div>
            <Text
              testid={`${testid}-items-count`}
              size='m'
            >{isAccountsLoading ? 'Loading items' : `${tokensCount} items`}</Text>
          </div>
          <InfiniteScroll
            hasMore={hasMore}
            initialLoad={false}
            loadMore={onClickSeeMore}
            pageStart={1}
            threshold={200}
            useWindow={true}
          >
            {!isAccountsLoading && !tokens?.length && <NoItems isSearchResult={!!searchValue || !!filterCount} />}
            <TokensList tokens={tokens || []} isLoading={isAccountsLoading} testid={`${testid}-tokens`} />
          </InfiniteScroll>
        </MainContent>
      </MarketMainPageStyled>
      {deviceSize <= DeviceSize.md && <MobileFilters
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterChange={onFilterChange}
        onSortingChange={onSortingChange}
        testid={`${testid}-mobile-filters`}
        filterComponent={<Filters
          value={filterState}
          attributes={attributes}
          attributeCounts={attributeCounts}
          onFilterChange={onFilterChange}
          testid={`${testid}-filters`}
        />}
      />}

    </CollectionPagePaper>
  </>);
};

const CollectionPagePaper = styled(PagePaper)`
  && {
    margin-top: calc(var(--gap) / 2);
  }
`;

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
`;

const LeftColumn = styled.div<{ isVisible?: boolean }>`
  margin-right: calc(var(--gap) * 2);
  display: ${({ isVisible }) => isVisible ? 'unset' : 'none'};
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MainContent = styled.div`
  flex: 1;

  > div:nth-of-type(2) {
    margin-top: 16px;
    margin-bottom: 32px;
  }

  @media (max-width: 1024px) {
    padding-left: 0;
  }
`;

const SortSelectWrapper = styled.div`
  .unique-select svg {
    z-index: 0;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SearchAndSortingWrapper = styled.div`
  margin-bottom: var(--gap);
  display: flex;
  justify-content: space-between;
`;
