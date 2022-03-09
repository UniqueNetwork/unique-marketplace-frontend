import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components/macro';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';

import { TokensList } from '../../components';
import { Secondary400 } from '../../styles/colors';
import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { Filters, FilterState } from './Filters/Filters';
import { useAccounts } from '../../hooks/useAccounts';
import { useOffers } from '../../api/restApi/offers/offers';
import { Offer } from '../../api/restApi/offers/types';

type TOption = {
  direction: 'asc' | 'desc';
  field: keyof Pick<Offer & NFTToken, 'price' | 'id' | 'creationDate'>;
  iconRight: {
    color: string;
    name: string;
    size: number;
  };
  id: string;
  title: string;
}

const pageSize = 100;

export const MyTokensPage = () => {
  const [filterState, setFilterState] = useState<FilterState>({});
  const [sortingValue, setSortingValue] = useState<string>('desc(CreationDate)');
  const [searchValue, setSearchValue] = useState<string>();
  const [searchString, setSearchString] = useState<string>();
  const [selectOption, setSelectOption] = useState<TOption>();
  const { selectedAccount } = useAccounts();
  const [tokens, setTokens] = useState<NFTToken[]>([]);

  const { offers } = useOffers({ page: 1, pageSize, seller: selectedAccount?.address });

  const { api } = useApi();

  useEffect(() => {
    if (!api || !selectedAccount?.address) return;
    (async () => {
      const _tokens = await api.nft?.getAccountTokens(selectedAccount.address) as NFTToken[];
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

  const onChangeSearchValue = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchString(searchValue);
  }, [searchValue]);

  const onFilterChange = useCallback((filter: FilterState) => {
    setFilterState((filterState) => ({ ...filterState, ...filter }));
  }, [setFilterState]);

  const filter = useCallback(
    (token: NFTToken & Partial<Offer>) => {
      let filterByStatus = true;
      if (filterState.onSell) {
        filterByStatus = !!token.seller;
      }
      if (filterState.fixedPrice) {
        filterByStatus = !!token.seller && !token.auction;
      }
      if (filterState.timedAuction) {
        filterByStatus = !!token.seller && !!token.auction;
      }
      if (filterState.notOnSale) {
        filterByStatus = !token.seller;
      }
      let filteredByPrice = true;
      if (filterState.minPrice && filterState.maxPrice) {
        if (!token.price) {
          filteredByPrice = false;
        } else {
          const tokenPrice = Number(token.price);
          filteredByPrice = (tokenPrice >= filterState.minPrice && tokenPrice <= filterState.maxPrice);
        }
      }
      let filteredByCollections = true;
      if (filterState.collectionIds && filterState.collectionIds.length > 0) {
        filteredByCollections = filterState.collectionIds.findIndex((collectionId: number) => token.collectionId === collectionId) > -1;
      }
      let filteredBySearchValue = true;
      if (searchString) {
        filteredBySearchValue = token.collectionName?.includes(searchString) || token.prefix?.includes(searchString) || token.tokenId === Number(searchString);
      }

      return filterByStatus && filteredByPrice && filteredByCollections && filteredBySearchValue;
    },
    [filterState, searchString]
  );

  const featuredTokens: (NFTToken & Partial<Offer>)[] = useMemo(() => {
    const tokensWithOffers = tokens.map((token) => ({
      ...(offers.find((offer) => offer.tokenId === token.id && offer.collectionId === token.collectionId) || {}),
      ...token
    })).filter(filter);

    if (selectOption) {
      return tokensWithOffers.sort((tokenA, tokenB) => {
        const order = selectOption.direction === 'asc' ? 1 : -1;
        return (tokenA[selectOption.field] || '') > (tokenB[selectOption.field] || '') ? order : -order;
      });
    }
    return tokensWithOffers;
  }, [tokens, offers, filter, selectOption]);

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
      field: 'id',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'asc(TokenId)',
      title: 'Token ID'
    },
    {
      direction: 'desc',
      field: 'id',
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
              onChange={onChangeSearchValue}
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
          <Text size='m'>{`${featuredTokens.length} items`}</Text>
        </div>
        <InfiniteScroll
          hasMore={hasMore}
          initialLoad={false}
          loadMore={onClickSeeMore}
          pageStart={1}
          threshold={200}
          useWindow={true}
        >
          <TokensList tokens={featuredTokens.filter(filter)} />
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
