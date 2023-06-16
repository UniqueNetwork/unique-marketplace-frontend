import { useCallback, useEffect, useMemo, useState } from 'react';

import { GetOffersRequestPayload, OffersResponse } from 'api/restApi/offers/types';
import { useAccounts } from 'hooks/useAccounts';
import { parseFilterState, setUrlParameter } from 'utils/helpers';
import { defaultSortingValue } from '../constants';
import { TOption } from '../types';
import { TokensResponse } from 'api/restApi/tokens/types';
import { useApi } from 'hooks/useApi';
import { Address } from '@unique-nft/utils';
import { TokensFilter } from '../Filters/types';

export const useCollectionTokensFilter = ({ isFetching, fetch }: { isFetching: boolean, fetch(payload: GetOffersRequestPayload): Promise<OffersResponse | TokensResponse> }) => {
  const { currentChainId, api } = useApi();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const searchParams = new URLSearchParams(window.location.search);

  const [filterState, setFilterState] = useState<TokensFilter | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchValue, setSearchValue] = useState<string | undefined>(searchParams.get('searchValue') || '');

  const getFilterByState = useCallback((filterState: TokensFilter | null) => {
    if (!filterState) return {};
    const { statuses, prices, collections, attributeCounts, attributes, belongingValue, ...otherFilter } = filterState;
    const { myNFTs, myBets, timedAuction, fixedPrice } = statuses || {};
    const seller = (myNFTs || (!!belongingValue && belongingValue !== 'All')) && selectedAccount?.address
      ? (Address.is.ethereumAddressInAnyForm(selectedAccount?.address) ? Address.normalize.ethereumAddress(selectedAccount?.address) : selectedAccount?.address)
      : undefined;
    const isOwner = belongingValue !== 'Disowned';

    return {
      seller,
      isOwner,
      bidderAddress: myBets ? selectedAccount?.address : undefined,
      isAuction: (timedAuction && fixedPrice) || (!timedAuction && !fixedPrice) ? undefined : !!timedAuction && !fixedPrice,
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
    void fetch({
      page: 1,
      pageSize: 20,
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
      pageSize: 20,
      ...(getFilterByState(filterState)),
      searchText: value || undefined,
      sort: [sortingValue]
    });
  }, [fetch, sortingValue, searchValue, filterState, getFilterByState]);

  const onFilterChange = useCallback(async (filterState: TokensFilter | null) => {
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    await fetch({
      page: 1,
      pageSize: 20,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      sort: [sortingValue]
    });
    setFilterState(filterState);
  }, [fetch, sortingValue, getFilterByState, searchValue]);

  const onChangeAccount = useCallback(() => {
    if (isFetching) return;
    void onFilterChange(filterState);
  }, [filterState, isFetching, onFilterChange]);

  useEffect(() => {
    if (!selectedAccount || isAccountsLoading) return;
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
      pageSize: 20,
      sort: [defaultSortingValue.id]
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
    getFilterByState
  };
};
