import { useCallback, useEffect, useMemo, useState } from 'react';

import { GetOffersRequestPayload, OffersResponse } from 'api/restApi/offers/types';
import { FilterState, TypeOfAssets, TypeOfCustomizableNFTs } from 'components/Filters/types';
import { useAccounts } from 'hooks/useAccounts';
import { parseFilterState, setUrlParameter } from 'utils/helpers';
import { defaultSortingValue } from '../constants';
import { TOption } from '../types';
import { TokensResponse } from 'api/restApi/tokens/types';
import { useApi } from 'hooks/useApi';
import { Address } from '@unique-nft/utils';
import { useIsFirstRender } from 'hooks/useIsFirstRender';
import { useCollections } from 'hooks/useCollections';
import { mockWearables } from 'pages/Token/constants';
import { SelectOptionProps } from 'components/UI/types';

export const useMarketFilter = ({ isFetching, fetch }: { isFetching: boolean, fetch(payload: GetOffersRequestPayload): Promise<OffersResponse | TokensResponse> }) => {
  const { currentChainId, api } = useApi();
  const { customizableCollections, featuredCollections } = useCollections();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const searchParams = new URLSearchParams(window.location.search);

  const [filterState, setFilterState] = useState<FilterState | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchValue, setSearchValue] = useState<string | undefined>(searchParams.get('searchValue') || '');

  const getFilterByState = useCallback((filterState: FilterState | null) => {
    if (!filterState) return {};
    const { statuses, prices, collections, attributeCounts, attributes, ...otherFilter } = filterState;
    const { myNFTs, myBets, timedAuction, fixedPrice } = statuses || {};
    const seller = myNFTs && selectedAccount?.address
      ? (Address.is.ethereumAddressInAnyForm(selectedAccount?.address)
        ? Address.normalize.ethereumAddress(selectedAccount?.address)
        : Address.normalize.substrateAddress(selectedAccount.address))
      : undefined;

    let _collections: number[] = [];

    // mocked wearables and base collections used to filter
    const wearables = mockWearables[currentChainId || ''].map(({ collectionId }) => collectionId);
    const customizables = mockWearables[currentChainId || ''].map(({ baseCollections }) => baseCollections).flat();
    if (otherFilter.typeOfAssets === TypeOfAssets.NFTs) {
      _collections = featuredCollections.map(({ id }) => id).filter((id) => {
        return ![...customizables, ...wearables].includes(id);
      });
    }
    if (otherFilter.typeOfAssets === TypeOfAssets.CustomizableNFTs) {
      _collections = [...customizables, ...wearables];
    }

    if (otherFilter.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.Base) {
      _collections = customizables;
    }
    if (otherFilter.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.Wearables) {
      _collections = wearables;
    }
    if (otherFilter.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.All) {
      _collections = [...wearables, ...customizables];
    }

    let collectionId = (collections?.length && _collections.length)
      ? collections.filter((value) => (_collections).includes(value))
      : [...(collections || []), ...(_collections || [])];

    if (collectionId.length === 0 && collections?.length && _collections.length) {
      collectionId = [0];
    }

    return {
      seller,
      bidderAddress: myBets ? selectedAccount?.address : undefined,
      isAuction: (timedAuction && fixedPrice) || (!timedAuction && !fixedPrice) ? undefined : !!timedAuction && !fixedPrice,
      ...prices,
      collectionId,
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

  const onFilterChange = useCallback(async (filterState: FilterState | null) => {
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

  const onMobileFilterApply = useCallback(async (filterState: FilterState | null, sorting: SelectOptionProps) => {
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    setUrlParameter('sortingValue', sorting.id as string);
    await fetch({
      page: 1,
      pageSize: 20,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      sort: [sorting.id as string]
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
  }, [isAccountsLoading]);

  useEffect(() => {
    if (selectedAccount?.address && filterState?.statuses?.myNFTs) {
      onChangeAccount();
    }
  }, [selectedAccount?.address]);

  const filterCount = useMemo(() => {
    const { statuses, prices, collections = [], attributes = [], attributeCounts = [], typeOfAssets, typeOfCustomizableNFTs } = filterState || {};
    const statusesCount: number = Object.values(statuses || {}).filter((status) => status).length;
    const collectionsCount: number = collections.length;
    const numberOfAttributesCount: number = attributeCounts.length;
    const attributesCount: number = attributes.length;
    const typesCount = (!typeOfAssets ? 0 : 1) + (!typeOfCustomizableNFTs ? 0 : 1);

    return statusesCount + collectionsCount + attributesCount + numberOfAttributesCount + (prices ? 1 : 0) + typesCount;
  }, [filterState]);

  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!currentChainId || !api || isFirstRender) return;
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
    getFilterByState,
    onMobileFilterApply
  };
};
