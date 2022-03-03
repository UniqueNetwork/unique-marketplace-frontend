import styled from 'styled-components/macro';
import { Filters, TokensList } from '../../components';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';
import { Secondary400 } from '../../styles/colors';
import { FilterState } from '../../components/Filters/types';
import { useOffers } from '../../api/restApi/offers/offers';
import { Offer } from '../../api/restApi/offers/types';
import { OffersList } from '../../components/OffersList/OffersList';

type TOption = {
  direction: 'asc' | 'desc';
  field: keyof Offer;
  iconRight: {
      color: string;
      name: string;
      size: number;
  };
  id: string;
  title: string;
}

const pageSize = 6;

export const MarketMainPage = () => {
  const [filterState, setFilterState] = useState<FilterState>({});
  const [sortingValue, setSortingValue] = useState<string>('desc(CreationDate)');
  const [searchValue, setSearchValue] = useState<string | number>();
  const [selectOption, setSelectOption] = useState<TOption>();
  const { offers, offersCount, isFetching, fetchMore, refetch } = useOffers({ pageSize, sort: [sortingValue] });

  useEffect(() => {
    const option = sortingOptions.find((option) => { return option.id === sortingValue; });

    setSelectOption(option);
  }, [sortingValue, setSelectOption]);

  const hasMore = offers && offers.length < offersCount;

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isFetching) {
      fetchMore({ page: Math.ceil(offers.length / pageSize) + 1, pageSize, sort: [sortingValue], ...filterState });
    }
  }, [fetchMore, offers, pageSize, isFetching]);

  const onSortingChange = useCallback((val: string) => {
    setSortingValue(val);
    refetch({ sort: [val], pageSize, page: 1, ...filterState });
  }, [refetch]);

  const handleSearch = () => {
    refetch({ sort: [sortingValue], pageSize, page: 1, searchText: searchValue?.toString(), ...filterState });
  };

  const onFilterChange = useCallback((filter: FilterState) => {
    setFilterState({ ...filterState, ...filter });
    refetch({ pageSize, page: 1, sort: [sortingValue], ...filterState, ...filter });
  }, [filterState]);

  const sortingOptions: TOption[] = [
    {
      direction: 'asc',
      field: 'price',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'asc(Price)',
      title: 'Price'
    },
    {
      direction: 'desc',
      field: 'price',
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'desc(Price)',
      title: 'Price'
    },
    {
      direction: 'asc',
      field: 'tokenId',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'asc(TokenId)',
      title: 'Token ID'
    },
    {
      direction: 'desc',
      field: 'tokenId',
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'desc(TokenId)',
      title: 'Token ID'
    },
    {
      direction: 'asc',
      field: 'creationDate',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'asc(CreationDate)',
      title: 'Listing date'
    },
    {
      direction: 'desc',
      field: 'creationDate',
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'desc(CreationDate)',
      title: 'Listing date'
    }
  ];

  return (
    <MarketMainPageStyled>
      <LeftColumn>
        <Filters onFilterChange={onFilterChange} />
      </LeftColumn>
      <MainContent>
        <SearchAndSorting>
          <Search>
            <InputText
              iconLeft={{ name: 'magnify', size: 16 }}
              onChange={(val) => setSearchValue(val)}
              placeholder='Collection / token'
              value={searchValue}
            ></InputText>
            <Button
              onClick={() => handleSearch()}
              role='primary'
              title='Search'
            />
          </Search>
          <Select
            onChange={onSortingChange}
            options={sortingOptions}
            value={sortingValue}
          />
        </SearchAndSorting>
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
          <OffersList offers={offers || []} />
        </InfiniteScroll>
      </MainContent>
    </MarketMainPageStyled>
  );
};

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
`;

const LeftColumn = styled.div`
  padding-right: 24px;
  border-right: 1px solid var(--grey-300);
`;

const MainContent = styled.div`
  padding-left: 32px;
  flex: 1;

  > div:nth-of-type(2) {
    margin-top: 16px;
    margin-bottom: 32px;
  }
`;

const Search = styled.div`
  display: flex;

  button {
    margin-left: 8px;
  }
`;

const SearchAndSorting = styled.div`
  display: flex;
  justify-content: space-between;
`;
