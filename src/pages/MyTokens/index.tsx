import React, { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components/macro';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';

import { TokensList } from '../../components';
import { Secondary400 } from '../../styles/colors';
import { FilterState } from '../../components/Filters/types';
import accountContext from '../../account/AccountContext';
import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { Filters } from './Filters/Filters';

type TOption = {
  direction: 'asc' | 'desc';
  field: 'price' | 'tokenId' | 'creationDate';
  iconRight: {
    color: string;
    name: string;
    size: number;
  };
  id: string;
  title: string;
}

export const MyTokensPage = () => {
  const [filterState, setFilterState] = useState<FilterState>({});
  const [sortingValue, setSortingValue] = useState<string>('desc(CreationDate)');
  const [searchValue, setSearchValue] = useState<string | number>();
  const [selectOption, setSelectOption] = useState<TOption>();
  const { selectedAccount } = useContext(accountContext);
  const [tokens, setTokens] = useState<NFTToken[]>([]);

  const { api } = useApi();

  useEffect(() => {
    if (!api || !selectedAccount?.address) return;
    (async () => {
      const _tokens = await api.nft?.getAccountTokens(selectedAccount?.address) as NFTToken[];
      setTokens(_tokens);
    })();
  }, [selectedAccount, api]);

  useEffect(() => {
    const option = sortingOptions.find((option) => { return option.id === sortingValue; });

    setSelectOption(option);
  }, [sortingValue, setSelectOption]);

  const hasMore = false;

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    // if (!isFetching) {
    //   fetchMore({ page: Math.ceil(offers.length / pageSize) + 1, pageSize, sort: [sortingValue], ...filterState });
    // }
  }, []);

  const onSortingChange = useCallback((val: string) => {
    setSortingValue(val);
  }, []);

  const handleSearch = () => {
    console.log(`go search ${searchValue}`);
  };

  const onFilterChange = useCallback((filter: FilterState) => {
    setFilterState({ ...filterState, ...filter });
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
              value={searchValue?.toString()}
            />
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
          <Text size='m'>{`${tokens.length} items`}</Text>
        </div>
        <InfiniteScroll
          hasMore={hasMore}
          initialLoad={false}
          loadMore={onClickSeeMore}
          pageStart={1}
          threshold={200}
          useWindow={true}
        >
          <TokensList tokens={tokens} />
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
