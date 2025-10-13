import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetOffersRequestPayload, OfferFilters, OffersAttributesResponse, OffersResponse } from 'api/restApi/offers/types';
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

const isEmptyFilterState = (filterState: FilterState | null): boolean => {
  if (!filterState) return true;
  
  const {
    statuses,
    prices,
    currencies,
    collections,
    attributes,
    attributeCounts,
    typeOfAssets,
    typeOfCustomizableNFTs
  } = filterState;

  const hasStatuses = statuses && Object.values(statuses).some(Boolean);
  const hasPrices = prices && (prices.minPrice || prices.maxPrice || prices.minUsdtPrice || prices.maxUsdtPrice);
  const hasCurrencies = currencies && currencies.length > 0;
  const hasCollections = collections && collections.length > 0;
  const hasAttributes = attributes && attributes.length > 0;
  const hasAttributeCounts = attributeCounts && attributeCounts.length > 0;
  const hasTypes = typeOfAssets || typeOfCustomizableNFTs;

  return !hasStatuses && !hasPrices && !hasCurrencies && !hasCollections && 
         !hasAttributes && !hasAttributeCounts && !hasTypes;
};

const transformSortValue = (sortValue: string, currencies?: number[]): string => {
  const shouldUseUsdtPrice = !currencies || currencies.length === 0 || currencies.length > 1;
  
  if (sortValue.includes('Price')) {
    if (shouldUseUsdtPrice) {
      return sortValue.replace(/\bPrice\b/g, 'UsdtPrice');
    } else {
      return sortValue.replace(/\bUsdtPrice\b/g, 'Price');
    }
  }
  
  return sortValue;
};

interface UseMarketFilterParams {
  isFetching: boolean;
  fetch(payload: GetOffersRequestPayload): Promise<OffersResponse | TokensResponse>;
  fetchAttributes: (payload: OfferFilters) => Promise<OffersAttributesResponse>;
}

export const useMarketFilter = ({
  isFetching,
  fetch,
  fetchAttributes
}: UseMarketFilterParams) => {
  const { currentChainId, api } = useApi();
  const { featuredCollections } = useCollections();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const searchParams = new URLSearchParams(window.location.search);

  const [filterState, setFilterState] = useState<FilterState | null>(
    parseFilterState(searchParams.get('filterState'))
  );
  const [sortingValue, setSortingValue] = useState<string>(
    searchParams.get('sortingValue') || defaultSortingValue.id
  );
  const [searchValue, setSearchValue] = useState<string | undefined>(
    searchParams.get('searchValue') || ''
  );
  
  const lastFetchAttributesParams = useRef<OfferFilters | null>(null);
  const prevAccountAddress = useRef<string | undefined>(selectedAccount?.address);
  const hasInitialLoadRef = useRef(false);
  
  const requestCounterRef = useRef(0);
  const lastSuccessfulRequestRef = useRef(0);

  const mockWearablesData = useMemo(() => {
    if (!currentChainId) return { wearables: [], customizables: [] };
    const wearables = mockWearables[currentChainId]?.map(({ collectionId }) => collectionId) || [];
    const customizables = mockWearables[currentChainId]?.map(({ baseCollections }) => baseCollections).flat() || [];
    return { wearables, customizables };
  }, [currentChainId]);

  const getFilterByState = useCallback((filterState: FilterState | null) => {
    if (!filterState) return {};
    
    const { statuses, prices, collections, attributeCounts, attributes, currencies, ...otherFilter } = filterState;
    const { myNFTs, myBets, timedAuction, fixedPrice } = statuses || {};
    
    const seller = myNFTs && selectedAccount?.address
      ? (Address.is.ethereumAddressInAnyForm(selectedAccount?.address)
        ? Address.normalize.ethereumAddress(selectedAccount?.address)
        : Address.normalize.substrateAddress(selectedAccount.address))
      : undefined;

    let _collections: number[] = [];
    const { wearables, customizables } = mockWearablesData;

    if (otherFilter.typeOfAssets === TypeOfAssets.NFTs) {
      _collections = featuredCollections
        .map(({ id }) => id)
        .filter((id) => ![...customizables, ...wearables].includes(id));
    } else if (otherFilter.typeOfAssets === TypeOfAssets.CustomizableNFTs) {
      _collections = [...customizables, ...wearables];
    }

    if (otherFilter.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.Base) {
      _collections = customizables;
    } else if (otherFilter.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.Wearables) {
      _collections = wearables;
    } else if (otherFilter.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.All) {
      _collections = [...wearables, ...customizables];
    }

    let collectionId = (collections?.length && _collections.length)
      ? collections.filter((value) => _collections.includes(value))
      : [...(collections || []), ...(_collections || [])];

    if (collectionId.length === 0 && collections?.length && _collections.length) {
      collectionId = [0];
    }

    const shouldUseUsdtPrice = !currencies || currencies.length === 0 || currencies.length > 1;
    
    let priceParams = {};
    let currencyParams = {};
    
    if (currencies && currencies.length > 0) {
      currencyParams = { currencies };
    }
    
    if (prices) {
      if (shouldUseUsdtPrice) {
        if (prices.minUsdtPrice) priceParams = { ...priceParams, minUsdtPrice: prices.minUsdtPrice };
        if (prices.maxUsdtPrice) priceParams = { ...priceParams, maxUsdtPrice: prices.maxUsdtPrice };
      } else {
        if (prices.minPrice) priceParams = { ...priceParams, minPrice: prices.minPrice };
        if (prices.maxPrice) priceParams = { ...priceParams, maxPrice: prices.maxPrice };
      }
    }

    return {
      seller,
      bidderAddress: myBets ? selectedAccount?.address : undefined,
      isAuction: (timedAuction && fixedPrice) || (!timedAuction && !fixedPrice) 
        ? undefined 
        : !!timedAuction && !fixedPrice,
      ...priceParams,
      ...currencyParams,
      collectionId,
      numberOfAttributes: attributeCounts,
      attributes: attributes?.map(({ attribute }) => attribute),
      ...otherFilter
    };
  }, [selectedAccount, mockWearablesData, featuredCollections]);

  const fetchFilterAttributes = useCallback(async (currentFilterState: FilterState | null) => {
    const params = {
      ...(getFilterByState(currentFilterState)),
      searchText: searchValue || undefined,
    };
  
    if (JSON.stringify(params) !== JSON.stringify(lastFetchAttributesParams.current)) {
      lastFetchAttributesParams.current = params;
      try {
        await fetchAttributes(params);
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    }
  }, [fetchAttributes, getFilterByState, searchValue]);

  const onSortingChange = useCallback((value: TOption) => {
    setSortingValue(value.id);
    setUrlParameter('sortingValue', value.id);
    
    const requestId = ++requestCounterRef.current;
    const transformedSort = transformSortValue(value.id, filterState?.currencies);
    
    void fetch({
      page: 1,
      pageSize: 20,
      ...(getFilterByState(filterState)),
      searchText: searchValue || undefined,
      sort: [transformedSort]
    }).then(() => {
      lastSuccessfulRequestRef.current = requestId;
    });
  }, [fetch, filterState, getFilterByState, searchValue]);

  const onSearch = useCallback(async (value?: string) => {
    setSearchValue(value);
    setUrlParameter('searchValue', value || '');
    
    const requestId = ++requestCounterRef.current;
    const transformedSort = transformSortValue(sortingValue, filterState?.currencies);
    
    try {
      await Promise.all([
        fetchFilterAttributes(filterState),
        fetch({
          page: 1,
          pageSize: 20,
          ...(getFilterByState(filterState)),
          searchText: value || undefined,
          sort: [transformedSort]
        }).then(() => {
          lastSuccessfulRequestRef.current = requestId;
        })
      ]);
    } catch (error) {
      console.error('Error during search:', error);
    }
  }, [fetch, sortingValue, filterState, getFilterByState, fetchFilterAttributes]);

  const onFilterChange = useCallback(async (filterState: FilterState | null) => {
    if (!filterState || isEmptyFilterState(filterState)) {
      setUrlParameter('filterState', '');
      setFilterState(null);
    } else {
      setUrlParameter('filterState', JSON.stringify(filterState));
      setFilterState(filterState);
    }

    // Race condition fix
    const requestId = ++requestCounterRef.current;
    const transformedSort = transformSortValue(sortingValue, filterState?.currencies);

    try {
      await Promise.all([
        fetchFilterAttributes(filterState),
        fetch({
          page: 1,
          pageSize: 20,
          ...(getFilterByState(filterState)),
          searchText: searchValue || undefined,
          sort: [transformedSort]
        }).then(() => {
          lastSuccessfulRequestRef.current = requestId;
        })
      ]);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }, [fetch, sortingValue, getFilterByState, searchValue, fetchFilterAttributes]);

  const onMobileFilterApply = useCallback(async (
    filterState: FilterState | null, 
    sorting: SelectOptionProps
  ) => {
    if (!filterState || isEmptyFilterState(filterState)) {
      setUrlParameter('filterState', '');
      setFilterState(null);
    } else {
      setUrlParameter('filterState', JSON.stringify(filterState));
      setFilterState(filterState);
    }
    
    setUrlParameter('sortingValue', sorting.id as string);
    setSortingValue(sorting.id as string);
    
    // Race condition fix
    const requestId = ++requestCounterRef.current;
    const transformedSort = transformSortValue(sorting.id as string, filterState?.currencies);
    
    try {
      await fetch({
        page: 1,
        pageSize: 20,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        sort: [transformedSort]
      }).then(() => {
        lastSuccessfulRequestRef.current = requestId;
      });
    } catch (error) {
      console.error('Error applying mobile filters:', error);
    }
  }, [fetch, getFilterByState, searchValue]);

  useEffect(() => {
    if (isAccountsLoading) return;
    if (prevAccountAddress.current === selectedAccount?.address) return;
    if (!filterState?.statuses?.myNFTs) return;
    
    prevAccountAddress.current = selectedAccount?.address;
    
    if (!isFetching) {
      void onFilterChange(filterState);
    }
  }, [selectedAccount?.address, isAccountsLoading, filterState?.statuses?.myNFTs, isFetching, onFilterChange]);

  const filterCount = useMemo(() => {
    if (!filterState) return 0;
    
    const { 
      statuses, 
      prices, 
      collections = [], 
      attributes = [], 
      attributeCounts = [], 
      typeOfAssets, 
      typeOfCustomizableNFTs,
      currencies = []
    } = filterState;
    
    const statusesCount = statuses 
      ? Object.values(statuses).filter(Boolean).length 
      : 0;
    const collectionsCount = collections.length;
    const numberOfAttributesCount = attributeCounts.length;
    const attributesCount = attributes.length;
    const pricesCount = prices ? 1 : 0;
    const typesCount = (typeOfAssets ? 1 : 0) + (typeOfCustomizableNFTs ? 1 : 0);
    const currenciesCount = currencies.length;

    return statusesCount + collectionsCount + attributesCount + 
           numberOfAttributesCount + pricesCount + typesCount + currenciesCount;
  }, [filterState]);

  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (hasInitialLoadRef.current) return;
    if (!currentChainId || !api) return;
    
    hasInitialLoadRef.current = true;

    const requestId = ++requestCounterRef.current;
    const transformedSort = transformSortValue(sortingValue, filterState?.currencies);

    void Promise.all([
      fetchFilterAttributes(filterState),
      fetch({
        page: 1,
        pageSize: 20,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        sort: [transformedSort]
      }).then(() => {
        lastSuccessfulRequestRef.current = requestId;
      })
    ]);
  }, [currentChainId, api]);

  useEffect(() => {
    if (!currentChainId || !api || isFirstRender) return;
    
    setFilterState(null);
    setSearchValue(undefined);
    setSortingValue(defaultSortingValue.id);
    
    // Race condition fix
    const requestId = ++requestCounterRef.current;
    
    void fetch({
      page: 1,
      pageSize: 20,
      sort: [defaultSortingValue.id]
    }).then(() => {
      lastSuccessfulRequestRef.current = requestId;
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
