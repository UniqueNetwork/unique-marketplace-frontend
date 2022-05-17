import { useCallback, useEffect, useState, KeyboardEvent, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

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
  const [filterState, setFilterState] = useState<FilterState | null>(null);
  const [sortingValue, setSortingValue] = useState<string>(defaultSortingValue.id);
  const [searchValue, setSearchValue] = useState<string | number>();
  const { offers, offersCount, isFetching, fetchMore, fetch } = useOffers();
  const { selectedAccount } = useAccounts();

  const hasMore = offers && offers.length < offersCount;

  useEffect(() => {
    fetch({ page: 1, pageSize });
  }, []);

  const getFilterByState = useCallback((filterState: FilterState | null) => {
    if (!filterState) return {};
    const { statuses, prices, ...otherFilter } = filterState;
    const { myNFTs, myBets, timedAuction, fixedPrice } = statuses || {};

    return {
      seller: myNFTs ? selectedAccount?.address : undefined,
      bidderAddress: myBets ? selectedAccount?.address : undefined,
      isAuction: (timedAuction && fixedPrice) || (!timedAuction && !fixedPrice) ? undefined : timedAuction && !fixedPrice,
      ...prices,
      ...otherFilter
    };
  }, [selectedAccount?.address]);

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isFetching) {
      fetchMore({ page: Math.ceil(offers.length / pageSize) + 1, pageSize, sort: [sortingValue], ...(getFilterByState(filterState)) });
    }
  }, [fetchMore, offers, pageSize, isFetching]);

  const onSortingChange = useCallback((value: TOption) => {
    setSortingValue(value.id);
    fetch({ sort: [value.id], pageSize, page: 1, ...(getFilterByState(filterState)) });
  }, [fetch, filterState, getFilterByState]);

  const onSearch = useCallback(() => {
    fetch({ sort: [sortingValue], pageSize, page: 1, searchText: searchValue?.toString(), ...(getFilterByState(filterState)) });
  }, [fetch, sortingValue, searchValue, filterState, getFilterByState]);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchValue(value);
  }, [setSearchValue]);

  const onSearchInputKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    onSearch();
  }, [onSearch]);

  const onFilterChange = useCallback((filterState: FilterState | null) => {
    setFilterState(filterState);
    fetch({ pageSize, page: 1, sort: [sortingValue], ...(getFilterByState(filterState)) });
  }, [fetch, sortingValue, getFilterByState]);

  useEffect(() => {
    if ((!filterState?.statuses?.myNFTs && !filterState?.statuses?.myBets) || isFetching) return;
    onFilterChange(filterState);
  }, [filterState, selectedAccount?.address]);

  const filterCount = useMemo(() => {
    const { statuses, prices, collections = [], traits = [] } = filterState || {};
    const statusesCount: number = Object.values(statuses || {}).filter((status) => status).length;
    const collectionsCount: number = collections.length;
    const traitsCount: number = traits.length;

    return statusesCount + collectionsCount + traitsCount + (prices ? 1 : 0);
  }, [filterState]);

  return (<PagePaper>
    <MarketMainPageStyled>
      <LeftColumn>
        <Filters value={filterState} onFilterChange={onFilterChange} />
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchField
            searchValue={searchValue}
            placeholder='Collection / token'
            onSearchStringChange={onSearchStringChange}
            onSearchInputKeyDown={onSearchInputKeyDown}
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
          <Text size='m'>{`${offersCount} items`}</Text>
        </div>
        <InfiniteScroll
          hasMore={hasMore}
          initialLoad={false}
          loadMore={onClickSeeMore}
          pageStart={1}
          threshold={200}
          useWindow={true}
        >
          {!isFetching && !offers?.length && <NoItems />}
          <OffersList offers={offers || []} isLoading={isFetching} />
        </InfiniteScroll>
      </MainContent>
    </MarketMainPageStyled>
    <MobileFilters
      value={filterState}
      filterCount={filterCount}
      defaultSortingValue={defaultSortingValue}
      sortingValue={sortingValue}
      sortingOptions={sortingOptions}
      onFilterChange={onFilterChange}
      onSortingChange={onSortingChange}
      filterComponent={Filters}
    />
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
