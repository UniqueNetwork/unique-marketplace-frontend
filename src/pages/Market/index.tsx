import styled from 'styled-components/macro';
import { Filters } from '../../components';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';
import { Secondary400 } from '../../styles/colors';
import { FilterState } from '../../components/Filters/types';
import { useOffers } from '../../api/restApi/offers/offers';
import { OffersList } from '../../components/OffersList/OffersList';
import { MobileFilters } from '../../components/Filters/MobileFilter';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import Loading from '../../components/Loading';
import NoItems from '../../components/NoItems';

type TOption = {
  iconRight: {
    color: string;
    name: string;
    size: number;
  };
  id: string;
  title: string;
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

const pageSize = 6;

const defaultSortingValue = 'desc(CreationDate)';

export const MarketPage = () => {
  const [filterState, setFilterState] = useState<FilterState | null>();
  const [sortingValue, setSortingValue] = useState<string>(defaultSortingValue);
  const [searchValue, setSearchValue] = useState<string | number>();
  const { offers, offersCount, isFetching, fetchMore, fetch } = useOffers();

  const hasMore = offers && offers.length < offersCount;

  useEffect(() => {
    fetch({ page: 1, pageSize });
  }, [fetch]);

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isFetching) {
      fetchMore({ page: Math.ceil(offers.length / pageSize) + 1, pageSize, sort: [sortingValue], ...filterState });
    }
  }, [fetchMore, offers, pageSize, isFetching]);

  const onSortingChange = useCallback((val: string) => {
    setSortingValue(val);
    fetch({ sort: [val], pageSize, page: 1, ...filterState });
  }, [fetch, filterState]);

  const handleSearch = () => {
    fetch({ sort: [sortingValue], pageSize, page: 1, searchText: searchValue?.toString(), ...filterState });
  };

  const onFilterChange = useCallback((filter: FilterState | null) => {
    setFilterState({ ...(filterState || {}), ...filter });
    fetch({ pageSize, page: 1, sort: [sortingValue], ...(filterState || {}), ...filter });
  }, [filterState, fetch, sortingValue]);

  return (<PagePaper>
    <MarketMainPageStyled>
      <LeftColumn>
        <Filters onFilterChange={onFilterChange} />
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchWrapper>
            <InputTextStyled
              iconLeft={{ name: 'magnify', size: 16 }}
              onChange={(val) => setSearchValue(val)}
              placeholder='Collection / token'
              value={searchValue?.toString()}
            />
            <Button
              onClick={() => handleSearch()}
              role='primary'
              title='Search'
            />
          </SearchWrapper>
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
          {isFetching && <Loading />}
          {!isFetching && !offers?.length && <NoItems />}
          <OffersList offers={offers || []} />
        </InfiniteScroll>
      </MainContent>
    </MarketMainPageStyled>
    <MobileFilters
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

const SearchWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  margin-right: 16px;
  button {
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    width: 100%;
    .unique-input-text {
      flex-grow: 1;
    }
  }

  @media (max-width: 320px) {
    .unique-button {
      display: none;
    }
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

const InputTextStyled = styled(InputText)`
  width: 100%;
  max-width: 610px;
`;
