import { useCallback, useEffect, useState, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Select, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { Filters } from '../../components';
import { Secondary400 } from '../../styles/colors';
import { FilterState } from '../../components/Filters/types';
import { useOffers } from '../../api/restApi/offers/offers';
import { OffersList } from '../../components/OffersList/OffersList';
import { MobileFilters } from '../../components/Filters/MobileFilter';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import NoItems from '../../components/NoItems';
import { useAccounts } from '../../hooks/useAccounts';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import SearchField from '../../components/SearchField/SearchField';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';
import { parseFilterState, setUrlParameter } from '../../utils/helpers';

type TOption = SelectOptionProps &{
  id: string
  title: string
}

const sortingOptions: TOption[] = [
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(Price)',
    title: 'Price'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(Price)',
    title: 'Price'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(TokenId)',
    title: 'Token ID'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(TokenId)',
    title: 'Token ID'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(CreationDate)',
    title: 'Listing date'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(CreationDate)',
    title: 'Listing date'
  }
];

const pageSize = 20;

const defaultSortingValue = sortingOptions[sortingOptions.length - 1];

export const MarketPage = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const [filterState, setFilterState] = useState<FilterState | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchValue, setSearchValue] = useState<string | undefined>(searchParams.get('searchValue') || '');
  const { offers, offersCount, isFetching, fetchMore, fetch, attributes, attributeCounts } = useOffers();
  const { selectedAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const hasMore = offers && offers.length < offersCount;

  useEffect(() => {
    void fetch({
      page: 1,
      pageSize,
      ...(getFilterByState(filterState)),
      searchText: searchValue,
      sort: [sortingValue]
    });
  }, []);

  const getFilterByState = useCallback((filterState: FilterState | null) => {
    if (!filterState) return {};
    const { statuses, prices, collections, attributeCounts, attributes, ...otherFilter } = filterState;
    const { myNFTs, myBets, timedAuction, fixedPrice } = statuses || {};

    return {
      seller: myNFTs ? selectedAccount?.address : undefined,
      bidderAddress: myBets ? selectedAccount?.address : undefined,
      isAuction: (timedAuction && fixedPrice) || (!timedAuction && !fixedPrice) ? undefined : !!timedAuction && !fixedPrice,
      ...prices,
      collectionId: collections,
      numberOfAttributes: attributeCounts,
      attributes: attributes?.map(({ attribute }) => attribute),
      ...otherFilter
    };
  }, [selectedAccount?.address]);

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isFetching) {
      fetchMore({
        page: Math.ceil(offers.length / pageSize) + 1,
        pageSize,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        sort: [sortingValue]
      });
    }
  }, [fetchMore, offers, pageSize, isFetching, searchValue]);

  const onSortingChange = useCallback((value: TOption) => {
    setSortingValue(value.id);
    setUrlParameter('sortingValue', value.id);
    void fetch({
      page: 1,
      pageSize,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      sort: [value.id]
    });
  }, [fetch, filterState, getFilterByState, searchValue]);

  const onSearch = useCallback((value?: string) => {
    setSearchValue(value);
    setUrlParameter('searchValue', value || '');
    void fetch({
      page: 1,
      pageSize,
      ...(getFilterByState(filterState)),
      searchText: value || undefined,
      sort: [sortingValue]
    });
  }, [fetch, sortingValue, searchValue, filterState, getFilterByState]);

  const onFilterChange = useCallback(async (filterState: FilterState | null) => {
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    const { attributesCount } = await fetch({
      page: 1,
      pageSize,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      sort: [sortingValue]
    });
    const _selectedAttributeCounts = filterState?.attributeCounts?.filter((item) => attributesCount.findIndex(({ numberOfAttributes }) => numberOfAttributes === item) > -1);
    setFilterState({ ...filterState, attributeCounts: _selectedAttributeCounts });
  }, [fetch, sortingValue, getFilterByState, searchValue]);

  useEffect(() => {
    if ((!filterState?.statuses?.myNFTs && !filterState?.statuses?.myBets) || isFetching) return;
    onFilterChange(filterState);
  }, [filterState, selectedAccount?.address]);

  const filterCount = useMemo(() => {
    const { statuses, prices, collections = [], attributes = [], attributeCounts = [] } = filterState || {};
    const statusesCount: number = Object.values(statuses || {}).filter((status) => status).length;
    const collectionsCount: number = collections.length;
    const numberOfAttributesCount: number = attributeCounts.length;
    const attributesCount: number = attributes.length;

    return statusesCount + collectionsCount + attributesCount + numberOfAttributesCount + (prices ? 1 : 0);
  }, [filterState]);

  return (<PagePaper>
    <MarketMainPageStyled>
      <LeftColumn>
        {deviceSize !== DeviceSize.md && <Filters
          value={filterState}
          attributes={attributes}
          attributeCounts={attributeCounts}
          onFilterChange={onFilterChange}
        />}
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchField
            searchValue={searchValue}
            placeholder='Collection / token'
            onSearch={onSearch}
          />
          <SortSelectWrapper>
            <Select
              onChange={onSortingChange}
              options={sortingOptions}
              value={sortingValue}
            />
          </SortSelectWrapper>
        </SearchAndSortingWrapper>
        <div>
          <Text size='m'>{isFetching ? 'Loading items' : `${offersCount} items`}</Text>
        </div>
        <InfiniteScroll
          hasMore={hasMore}
          initialLoad={false}
          loadMore={onClickSeeMore}
          pageStart={1}
          threshold={200}
          useWindow={true}
        >
          {!isFetching && !offers?.length && <NoItems isSearchResult={!!searchValue || !!filterCount} />}
          <OffersList offers={offers || []} isLoading={isFetching} />
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
      filterComponent={<Filters
        value={filterState}
        attributes={attributes}
        attributeCounts={attributeCounts}
        onFilterChange={onFilterChange}
      />}
    />}
  </PagePaper>);
};

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
`;

const LeftColumn = styled.div`
  padding-right: 24px;
  border-right: 1px solid var(--grey-300);
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MainContent = styled.div`
  position: relative;
  padding-left: calc(var(--gap) * 2);
  flex: 1;

  > div:nth-of-type(2) {
    margin-top: var(--gap);
    margin-bottom: calc(var(--gap) * 2);
  }

  @media (max-width: 1024px) {
    padding-left: 0;
  }
`;

const SortSelectWrapper = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }

  .unique-select svg {
    z-index: 0;
  }
`;

const SearchAndSortingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
