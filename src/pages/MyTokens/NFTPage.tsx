import React, { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/macro';
import BN from 'bn.js';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';

import { TokensList } from '../../components';
import { Secondary400 } from '../../styles/colors';
import { useApi } from '../../hooks/useApi';
import { NFTToken } from '../../api/chainApi/unique/types';
import { Filters, MyTokensFilterState } from './Filters/Filters';
import { useAccounts } from '../../hooks/useAccounts';
import { useOffers } from '../../api/restApi/offers/offers';
import { Offer } from '../../api/restApi/offers/types';
import { MobileFilters } from '../../components/Filters/MobileFilter';
import Loading from '../../components/Loading';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import NoItems from '../../components/NoItems';
import { fromStringToBnString } from '../../utils/bigNum';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';

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
      const filterByStatus = (token: NFTToken & Partial<Offer>) => {
        if (!filterState?.onSell && !filterState?.fixedPrice && !filterState?.timedAuction && !filterState?.notOnSale) return true;
        return (filterState?.onSell && !!token.seller) ||
          (filterState?.fixedPrice && !!token.seller && !token.auction) ||
          (filterState?.timedAuction && !!token.seller && !!token.auction) ||
          (filterState?.notOnSale && !token.seller);
      };

      let filteredByPrice = true;
      if (filterState?.minPrice && filterState?.maxPrice) {
        if (!token.price) {
          filteredByPrice = false;
        } else {
          const tokenPrice = new BN(token.price);
          const minPrice = new BN(fromStringToBnString(filterState.minPrice, api?.market?.kusamaDecimals));
          const maxPrice = new BN(fromStringToBnString(filterState.maxPrice, api?.market?.kusamaDecimals));
          filteredByPrice = (tokenPrice.gte(minPrice) && tokenPrice.lte(maxPrice));
        }
      }
      let filteredByCollections = true;
      if (filterState?.collectionIds && filterState?.collectionIds.length > 0) {
        filteredByCollections = filterState.collectionIds.findIndex((collectionId: number) => token.collectionId === collectionId) > -1;
      }
      let filteredBySearchValue = true;
      if (searchString) {
        filteredBySearchValue = token.collectionName?.includes(searchString) || token.prefix?.includes(searchString) || token.id === Number(searchString);
      }

      return filterByStatus(token) && filteredByPrice && filteredByCollections && filteredBySearchValue;
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

  return (<PagePaper>
    <MarketMainPageStyled>
      <LeftColumn>
        <Filters onFilterChange={setFilterState} />
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchWrapper>
            <InputTextStyled
              iconLeft={{ name: 'magnify', size: 16 }}
              onChange={onChangeSearchValue}
              onKeyDown={onSearchInputKeyDown}
              placeholder='Collection / token'
              value={searchValue?.toString()}
            />
            <Button
              onClick={onSearch}
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
          <Text size='m'>{`${featuredTokens.length} items`}</Text>
        </div>
        <TokensListWrapper >
          {!isFetchingTokens && !isFetchingOffers && featuredTokens.length === 0 && <NoItems />}
          <TokensList tokens={featuredTokens} isLoading={isFetchingTokens || isFetchingOffers} />
        </TokensListWrapper>
      </MainContent>
      <MobileFilters<MyTokensFilterState>
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
    margin-right: 0;
    .unique-button {
      display: none;
    }
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

const InputTextStyled = styled(InputText)`
  width: 100%;
  max-width: 610px;
`;
