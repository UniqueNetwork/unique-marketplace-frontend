import { useCallback, useEffect, useMemo, useState } from 'react';

import { GetOffersRequestPayload, OffersResponse } from 'api/restApi/offers/types';
import { useAccounts } from 'hooks/useAccounts';
import { parseFilterState, setUrlParameter } from 'utils/helpers';
import { defaultSortingValue, pageSize } from '../constants';
import { TOption } from '../types';
import { GetTokensRequestPayload, TokensResponse } from 'api/restApi/tokens/types';
import { useApi } from 'hooks/useApi';
import { Address } from '@unique-nft/utils';
import { TokensFilter } from '../Filters/types';
import { SelectOptionProps } from '@unique-nft/ui-kit';

export const useCollectionTokensFilter = ({ isFetching, fetch }: { isFetching: boolean, fetch(payload: GetTokensRequestPayload): Promise<OffersResponse | TokensResponse> }) => {
  const { currentChainId, api } = useApi();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const searchParams = new URLSearchParams(window.location.search);

  const [filterState, setFilterState] = useState<TokensFilter | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchValue, setSearchValue] = useState<string | undefined>(searchParams.get('searchValue') || '');

  const getFilterByState = useCallback((filterState: TokensFilter | null) => {
    if (!filterState) return {};
    const { statuses, prices, collections, attributeCounts, attributes, belongingValue, ...otherFilter } = filterState;
    const { fixedPrice } = statuses || {};
    const address = (fixedPrice || (!!belongingValue && belongingValue !== 'All')) && selectedAccount?.address
      ? (Address.is.ethereumAddressInAnyForm(selectedAccount?.address)
        ? Address.normalize.ethereumAddress(selectedAccount?.address)
        : selectedAccount?.address)
      : undefined;

    return {
      address,
      accessoryType: belongingValue || 'All',
      saleType: fixedPrice ? 'OnSale' : 'All',
      ...prices,
      collectionId: collections,
      numberOfAttributes: attributeCounts,
      attributes: attributes?.map(({ attribute }) => attribute),
      ...otherFilter
    };
  }, [selectedAccount]);

  const onSortingChange = useCallback((value: TOption) => {
    setSortingValue(value.id);
    setUrlParameter('sortingValue', value.id);
    window.scrollTo({ top: 0 });
    void fetch({
      page: 1,
      pageSize,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      'sort[0]': [value.id]
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
      'sort[0]': [sortingValue]
    });
  }, [fetch, sortingValue, searchValue, filterState, getFilterByState]);

  const onFilterChange = useCallback(async (filterState: TokensFilter | null) => {
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    setFilterState(filterState);
    console.log('onFilterChange');
    await fetch({
      page: 1,
      pageSize,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      'sort[0]': [sortingValue]
    });
  }, [fetch, sortingValue, getFilterByState, searchValue]);

  const onMobileFilterApply = useCallback(async (filterState: TokensFilter | null, sorting: SelectOptionProps) => {
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    setUrlParameter('sortingValue', sorting.id as string);
    await fetch({
      page: 1,
      pageSize: 20,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      'sort[0]': [sorting.id as string]
    });
    setFilterState(filterState);
    setSortingValue(sorting.id as string);
  }, [fetch, getFilterByState, searchValue]);

  const onChangeAccount = useCallback(() => {
    if (isFetching) return;
    void onFilterChange(filterState);
  }, [filterState, isFetching, onFilterChange]);

  useEffect(() => {
    if (isAccountsLoading) return;
    onChangeAccount();
  }, [selectedAccount?.address, isAccountsLoading]);

  const filterCount = useMemo(() => {
    const { statuses, prices, collections = [], attributes = [], attributeCounts = [] } = filterState || {};
    const statusesCount: number = Object.values(statuses || {}).filter((status) => status).length;
    const collectionsCount: number = collections.length;
    const numberOfAttributesCount: number = attributeCounts.length;
    const attributesCount: number = attributes.length;

    return statusesCount + collectionsCount + attributesCount + numberOfAttributesCount + (prices ? 1 : 0);
  }, [filterState]);

  useEffect(() => {
    if (!currentChainId || !api) return;
    setFilterState(null);
    setSearchValue(undefined);
    setSortingValue(defaultSortingValue.id);
    void fetch({
      page: 1,
      pageSize,
      'sort[0]': [defaultSortingValue.id]
    });
  }, [currentChainId]);

  return {
    filterState,
    sortingValue,
    searchValue,
    filterCount,
    onFilterChange,
    onSortingChange,
    onSearch,
    setFilterState,
    setSortingValue,
    setSearchValue,
    getFilterByState,
    onMobileFilterApply
  };
};
