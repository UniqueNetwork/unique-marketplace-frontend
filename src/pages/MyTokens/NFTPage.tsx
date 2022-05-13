import React, { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/macro';
import BN from 'bn.js';
import { Select, Text } from '@unique-nft/ui-kit';
import { BN_MAX_INTEGER } from '@polkadot/util';

import { TokensList } from '../../components';
import { Secondary400 } from '../../styles/colors';
import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { Filters } from './Filters/Filters';
import { useAccounts } from '../../hooks/useAccounts';
import { useOffers } from '../../api/restApi/offers/offers';
import { Offer } from '../../api/restApi/offers/types';
import { MobileFilters } from '../../components/Filters/MobileFilter';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import NoItems from '../../components/NoItems';
import { fromStringToBnString } from '../../utils/bigNum';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { MyTokensFilterState } from './Filters/types';
import SearchField from '../../components/SearchField/SearchField';

type TOption = SelectOptionProps & {
  direction: 'asc' | 'desc';
  field: keyof Pick<Offer & NFTToken, 'price' | 'id' | 'creationDate'>;
  id: string;
  title: string;
}

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

const pageSize = 1000;

const defaultSortingValue = sortingOptions[sortingOptions.length - 1];

export const NFTPage = () => {
  const [filterState, setFilterState] = useState<MyTokensFilterState | null>(null);
  const [sortingValue, setSortingValue] = useState<string>(defaultSortingValue.id);
  const [searchValue, setSearchValue] = useState<string>();
  const [searchString, setSearchString] = useState<string>();
  const [selectOption, setSelectOption] = useState<TOption>();
  const { selectedAccount } = useAccounts();
  const [tokens, setTokens] = useState<NFTToken[]>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState<boolean>(true);

  const { offers, isFetching: isFetchingOffers, fetch } = useOffers();

  const { api } = useApi();

  useEffect(() => {
    if (!api?.nft || !selectedAccount?.address) return;
    setIsFetchingTokens(true);
    void (async () => {
      await fetch({ page: 1, pageSize, seller: selectedAccount?.address });
      const _tokens = await api.nft?.getAccountTokens(selectedAccount.address) as NFTToken[];

      setTokens(_tokens);
      setIsFetchingTokens(false);
    })();
  }, [api?.nft, selectedAccount?.address, setIsFetchingTokens, fetch]);

  useEffect(() => {
    const option = sortingOptions.find((option) => { return option.id === sortingValue; });

    setSelectOption(option);
  }, [sortingValue, setSelectOption]);

  const onSortingChange = useCallback((val: TOption) => {
    setSortingValue(val.id);
  }, []);

  const onChangeSearchValue = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const onSearch = useCallback(() => {
    setSearchString(searchValue);
  }, [searchValue]);

  const onSearchInputKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    onSearch();
  }, [onSearch]);

  const filter = useCallback((token: NFTToken & Partial<Offer>) => {
      const { statuses, prices } = filterState || {};

      const filterByStatus = (token: NFTToken & Partial<Offer>) => {
        const { onSell, fixedPrice, timedAuction, notOnSale } = statuses || {};
        if (!onSell && !fixedPrice && !timedAuction && !notOnSale) return true;
        return (onSell && !!token.seller) ||
          (fixedPrice && !!token.seller && !token.auction) ||
          (timedAuction && !!token.seller && !!token.auction) ||
          (notOnSale && !token.seller);
      };

      let filteredByPrice = true;
      if (prices?.minPrice || prices?.maxPrice) {
        if (!token.price) {
          filteredByPrice = false;
        } else {
          const tokenPrice = new BN(token.price);
          const minPrice = new BN(fromStringToBnString(prices.minPrice || '0', api?.market?.kusamaDecimals));
          const maxPrice = prices.maxPrice ? new BN(fromStringToBnString(prices.maxPrice, api?.market?.kusamaDecimals)) : BN_MAX_INTEGER;
          filteredByPrice = (tokenPrice.gte(minPrice) && tokenPrice.lte(maxPrice));
        }
      }
      let filteredByCollections = true;
      if (filterState?.collections && filterState.collections.length > 0) {
        filteredByCollections = filterState.collections.findIndex((collectionId: number) => token.collectionId === collectionId) > -1;
      }
      let filteredByTraits = true;
      if (filterState?.traits && filterState.traits.length > 0) {
        filteredByTraits = filterState?.traits.some((trait) => {
          return (token?.attributes?.Traits as string[])?.indexOf(trait) >= 0;
        });
      }
      let filteredBySearchValue = true;
      if (searchString) {
        filteredBySearchValue = token.collectionName?.includes(searchString) || token.prefix?.includes(searchString) || token.id === Number(searchString);
      }

      return filterByStatus(token) && filteredByPrice && filteredByCollections && filteredByTraits && filteredBySearchValue;
    },
    [filterState, searchString, api?.market?.kusamaDecimals]
  );

  const featuredTokens: (NFTToken & Partial<Offer>)[] = useMemo(() => {
    const tokensWithOffers: (NFTToken & Partial<Offer>)[] = [
      ...(offers?.map<NFTToken & Partial<Offer>>((offer) => ({
        id: offer.tokenId,
        collectionName: offer.tokenDescription?.collectionName || '',
        prefix: offer.tokenDescription?.prefix || '',
        imageUrl: offer.tokenDescription?.image || '',
        ...offer
      })) || []),
      ...tokens
    ].filter(filter);

    if (selectOption) {
      return tokensWithOffers.sort((tokenA, tokenB) => {
        const order = selectOption.direction === 'asc' ? 1 : -1;
        return (tokenA[selectOption.field] || '') > (tokenB[selectOption.field] || '') ? order : -order;
      });
    }
    return tokensWithOffers;
  }, [tokens, offers, filter, selectOption]);

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
        <Filters value={filterState} onFilterChange={setFilterState} />
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchField
            searchValue={searchValue}
            placeholder='Collection / token'
            onSearchStringChange={onChangeSearchValue}
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
          <Text size='m'>{`${featuredTokens.length} items`}</Text>
        </div>
        <TokensListWrapper >
          {!isFetchingTokens && !isFetchingOffers && featuredTokens.length === 0 && <NoItems />}
          <TokensList tokens={featuredTokens} isLoading={isFetchingTokens || isFetchingOffers} />
        </TokensListWrapper>
      </MainContent>
      <MobileFilters<MyTokensFilterState>
        value={filterState}
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterChange={setFilterState}
        onSortingChange={onSortingChange}
        filterComponent={Filters}
      />
    </MarketMainPageStyled>
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
  padding-left: 32px;
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
  display: flex;
  justify-content: space-between;
`;

const TokensListWrapper = styled.div`
  min-height: 640px;
`;
