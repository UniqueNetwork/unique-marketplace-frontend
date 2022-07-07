import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
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
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';
import { setUrlParameter, parseFilterState } from '../../utils/helpers';

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
  const searchParams = new URLSearchParams(window.location.search);
  const [filterState, setFilterState] = useState<MyTokensFilterState | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchString, setSearchString] = useState<string>(searchParams.get('searchValue') || '');
  const [selectOption, setSelectOption] = useState<TOption>();
  const { selectedAccount, isLoading } = useAccounts();
  const [tokens, setTokens] = useState<NFTToken[]>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState<boolean>(false);
  const deviceSize = useDeviceSize();

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
    setUrlParameter('sortingValue', val.id);
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearchString(value);
    setUrlParameter('searchValue', value || '');
  }, [setSearchString]);

  const filter = useCallback((token: NFTToken & Partial<Offer>) => {
      const { statuses, prices } = filterState || {};
      setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
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
      let filteredByAttributeCounts = true;
      if (filterState?.attributeCounts && filterState.attributeCounts.length > 0) {
        filteredByAttributeCounts = filterState?.attributeCounts.some((attributeCount) => {
          const _count = Object.values(token.attributes || {})
            .reduce((acc, attribute) => acc + (Array.isArray(attribute) ? attribute.length : 0), 0);
          return _count === attributeCount;
        });
      }
      let filteredByAttributes = true;
      if (filterState?.attributes && filterState.attributes.length > 0) {
        filteredByAttributes = filterState?.attributes.some((attributeItem) => {
          return token.attributes?.[attributeItem.key] && Array.isArray(token.attributes[attributeItem.key]) && (token.attributes[attributeItem.key] as string[])
            .some((_attribute) => _attribute === attributeItem.attribute);
        });
      }
      let filteredBySearchValue = true;
      if (searchString) {
        filteredBySearchValue = token.collectionName?.toLowerCase().includes(searchString.toLowerCase()) ||
          token.prefix?.toLowerCase().includes(searchString.toLowerCase()) ||
          token.id === Number(searchString);
      }

      return filterByStatus(token) && filteredByPrice && filteredByCollections && filteredByAttributeCounts && filteredByAttributes && filteredBySearchValue;
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
        {deviceSize !== DeviceSize.md && <Filters value={filterState} onFilterChange={setFilterState} />}
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchField
            searchValue={searchString}
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
          <Text size='m'>{isFetchingTokens || isFetchingOffers || isLoading ? 'Loading items' : `${featuredTokens.length} items`}</Text>
        </div>
        <TokensListWrapper >
          {!isFetchingTokens && !isFetchingOffers && !isLoading && featuredTokens.length === 0 && <NoItems />}
          <TokensList tokens={featuredTokens} isLoading={isFetchingTokens || isFetchingOffers || isLoading} />
        </TokensListWrapper>
      </MainContent>
      {deviceSize <= DeviceSize.md && <MobileFilters<MyTokensFilterState>
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterChange={setFilterState}
        onSortingChange={onSortingChange}
        filterComponent={<Filters
          value={filterState}
          onFilterChange={setFilterState}
        />}
      />}
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
