import { BN, BN_MAX_INTEGER } from '@polkadot/util';
import { DecodedAttributeDto } from '@unique-nft/sdk';

import { Offer } from 'api/restApi/offers/types';
import { TypeOfAssets, TypeOfCustomizableNFTs } from 'components/Filters/types';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';
import { mockWearables } from 'pages/Token/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fromStringToBnString } from 'utils/bigNum';
import { parseFilterState, setUrlParameter } from 'utils/helpers';
import { defaultSortingValue, sortingOptions } from '../constants';
import { MyTokensFilterState } from '../Filters/types';
import { countTokenAttributes } from '../Filters/utils/attributes';
import { MixedMyTokenAndOffer, MyToken, TOption } from '../types';
import { GQLCollection } from 'api/scanApi/types';
import { SelectOptionProps } from 'components/UI/types';

export type UseMyTokensFilterProps = {
  isFetchingTokens: boolean
  tokens: MyToken[]
  offers: Offer[]
};

export const useMyTokensFilter = ({ tokens, offers, isFetchingTokens }: UseMyTokensFilterProps) => {
  const searchParams = new URLSearchParams(window.location.search);
  const [filterState, setFilterState] = useState<MyTokensFilterState | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchString, setSearchString] = useState<string>(searchParams.get('searchValue') || '');
  const [selectOption, setSelectOption] = useState<TOption>();
  const { featuredCollections } = useCollections();
  const { api, currentChainId } = useApi();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();

  useEffect(() => {
    if (!api) return;
    // clear filters and searchString if chainId has been changed
    setFilterState(null);
    setSearchString('');
    setSortingValue(defaultSortingValue.id);
  }, [currentChainId]);

  useEffect(() => {
    if (!selectedAccount || isAccountsLoading) return;
    setFilterState((filter) => filter
      ? {
        ...filter,
        attributeCounts: [],
        attributes: []
      }
      : null
    );
  }, [selectedAccount?.address]);

  useEffect(() => {
    const option = sortingOptions.find((option) => { return option.id === sortingValue; });
    setSelectOption(option);
  }, [sortingValue, setSelectOption]);

  useEffect(() => {
    const option = sortingOptions.find((option) => { return option.id === sortingValue; });
    setSelectOption(option);
  }, [sortingValue, setSelectOption]);

  // attribute counts calculated based on tokens filtered by all filters except attribute count filter
  const filterForAttributeCounts = useCallback((token: MixedMyTokenAndOffer) => {
    const { statuses, prices } = filterState || {};
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    const filterByStatus = (token: MixedMyTokenAndOffer) => {
      const { onSell, fixedPrice, timedAuction, notOnSale } = statuses || {};
      if (!onSell && !fixedPrice && !timedAuction && !notOnSale) return true;
      return (onSell && !fixedPrice && !timedAuction && !!token.seller) ||
        (fixedPrice && !!token.seller) ||
        (timedAuction && !!token.seller) ||
        (notOnSale && !token.seller);
    };

    let filteredByPrice = true;
    if (prices?.minPrice || prices?.maxPrice) {
      if (!token.price?.raw) {
        filteredByPrice = false;
      } else {
        const tokenPrice = new BN(token?.price.raw);
        const minPrice = new BN(fromStringToBnString(prices.minPrice || '0', api?.market?.decimals));
        const maxPrice = prices.maxPrice ? new BN(fromStringToBnString(prices.maxPrice, api?.market?.decimals)) : BN_MAX_INTEGER;
        filteredByPrice = (tokenPrice.gte(minPrice) && tokenPrice.lte(maxPrice));
      }
    }
    // mocked wearables and base collections used to filter
    const wearables = mockWearables[currentChainId || ''].map(({ collectionId }) => collectionId);
    const customizables = mockWearables[currentChainId || ''].map(({ baseCollections }) => baseCollections).flat();
    let filteredByTypeOfAssets = true;
    if (filterState?.typeOfAssets) {
      const isCustomizable = [...wearables, ...customizables].includes(token.collectionId);
      filteredByTypeOfAssets = filterState?.typeOfAssets === TypeOfAssets.CustomizableNFTs ? isCustomizable : !isCustomizable;
    }
    let filteredByTypeOfCustomizable = true;
    if (filterState?.typeOfCustomizableNFTs) {
      if (filterState.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.All) {
        filteredByTypeOfCustomizable = [...wearables, ...customizables].includes(token.collectionId);
      } else {
        filteredByTypeOfCustomizable = filterState?.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.Base
          ? customizables.includes(token.collectionId)
          : filterState?.typeOfCustomizableNFTs === TypeOfCustomizableNFTs.Wearables ? wearables.includes(token.collectionId) : false;
      }
    }

    let filteredByCollections = true;
    if (filterState?.collections && filterState.collections.length > 0) {
      filteredByCollections = filterState.collections.findIndex((collectionId: number) => token.collectionId === collectionId) > -1;
    }
    let filteredByAttributes = true;
    if (filterState?.attributes && filterState.attributes.length > 0) {
      filteredByAttributes = filterState?.attributes.every((attributeItem) => {
        const attribute = Object.values(token.attributes || {}).find((attribute) => attribute.name?._?.toLowerCase() === attributeItem.key.toLowerCase());
        return (attribute && attribute.isArray)
          ? (attribute.value as ({ _: string | number })[])
            .some((_attribute) => _attribute._ === attributeItem.attribute)
          : ((attribute?.value as {_: string })?._ === attributeItem.attribute);
      });
    }
    let filteredBySearchValue = true;
    if (searchString) {
      const { tokenPrefix, name: collectionName } = token.collectionDescription || {};

      filteredBySearchValue = token.tokenId === Number(searchString) ||
        token.collectionId === Number(searchString) ||
        tokenPrefix?.includes(searchString.toLowerCase()) || // offer
        collectionName?.includes(searchString.toLowerCase()) || // offer
        featuredCollections.some(({ id, name, tokenPrefix }) => { // token
          return id === token.collectionId && `${name || ''} ${tokenPrefix || ''}`.toLowerCase().includes(searchString.toLowerCase());
        });
    }

    return filterByStatus(token) && filteredByPrice && filteredByTypeOfAssets && filteredByTypeOfCustomizable && filteredByCollections && filteredByAttributes && filteredBySearchValue;
  },
    [filterState, searchString, featuredCollections, api?.market?.decimals, currentChainId]
  );

  const filterByAttributeCounts = useCallback((token: MixedMyTokenAndOffer) => {
    let filteredByAttributeCounts = true;
    if (filterState?.attributeCounts && filterState.attributeCounts.length > 0) {
      filteredByAttributeCounts = filterState?.attributeCounts.some((attributeCount) => {
        return countTokenAttributes(token.attributes) === attributeCount;
      });
    }
    return filteredByAttributeCounts;
  }, [filterState]);

  const tokensWithOffers: MixedMyTokenAndOffer[] = useMemo(() => {
    return [
      ...tokens.map((token) => {
        const offer = offers.find(({ tokenId, collectionId }) => token.tokenId === tokenId && token.collectionId === collectionId);
        if (offer) {
          return {
            ...offer,
            owner: offer.seller,
            attributes: offer?.tokenDescription
              ? (Object.values(
                  offer?.tokenDescription?.attributes
                ) as DecodedAttributeDto[])
              : []
          };
        }
        return token;
      })
    ];
  }, [tokens, offers]);

  const featuredTokensForAttributeCounts: MixedMyTokenAndOffer[] = useMemo(() => {
    return tokensWithOffers.filter(filterForAttributeCounts);
  }, [tokensWithOffers, filterForAttributeCounts]);

  const featuredTokens: MixedMyTokenAndOffer[] = useMemo(() => {
    const filteredTokens: MixedMyTokenAndOffer[] = featuredTokensForAttributeCounts.filter(filterByAttributeCounts);

    if (selectOption) {
      return filteredTokens.sort((tokenA, tokenB) => {
        const order = selectOption.direction === 'asc' ? 1 : -1;
        return (tokenA?.[selectOption.field] || '') > (tokenB?.[selectOption.field] || '') ? order : -order;
      });
    }
    return filteredTokens;
  }, [featuredTokensForAttributeCounts, selectOption, filterByAttributeCounts]);

  const filterCount = useMemo(() => {
    const { statuses, prices, collections = [], attributes = [], attributeCounts = [] } = filterState || {};
    const statusesCount: number = Object.values(statuses || {}).filter((status) => status).length;
    const collectionsCount: number = collections.length;
    const numberOfAttributesCount: number = attributeCounts.length;
    const attributesCount: number = attributes.length;

    return statusesCount + collectionsCount + attributesCount + numberOfAttributesCount + (prices ? 1 : 0);
  }, [filterState]);

  const myCollections: GQLCollection[] = useMemo(() => {
    const collections: Map<number, GQLCollection> = new Map();

    offers.forEach(({ collectionId, collectionDescription: { owner, schema, name, mode, tokenPrefix } }) => {
      if (collections.has(collectionId)) return;
      collections.set(collectionId, {
        id: collectionId,
        cover: schema?.coverPicture?.fullUrl || '',
        name,
        owner,
        tokenPrefix,
        isMarketable: true,
        allowedTokens: '',
        tokenLimit: 0,
        tokensCount: 0,
        properties: [],
        attributesSchema: {},
        mode: mode || 'NFT',
        creationDate: 0,
        permissions: {
          access: 'Normal',
          nesting: {
            restricted: [],
            tokenOwner: false,
            collectionAdmin: false
          }
        }
      });
    });
    tokens.forEach(({ collectionId, collectionCover, collectionName, collectionOwner, tokenPrefix, type }) => {
      if (collections.has(collectionId)) return;
      collections.set(collectionId, {
        id: collectionId,
        cover: collectionCover || '',
        name: collectionName || '',
        owner: collectionOwner || '',
        tokenPrefix: tokenPrefix || '',
        isMarketable: featuredCollections.findIndex(({ id }) => id === collectionId) !== -1,
        allowedTokens: '',
        tokenLimit: 0,
        tokensCount: 0,
        properties: [],
        attributesSchema: {},
        creationDate: 0,
        mode: type === 'RFT' ? 'ReFungible' : 'NFT',
        permissions: {
          access: 'Normal',
          nesting: {
            restricted: [],
            tokenOwner: false,
            collectionAdmin: false
          }
        }

      });
    });
    return [...collections.values()];
  }, [featuredCollections, tokens, offers]);

  const onSearch = useCallback((value: string) => {
    setSearchString(value);
    setUrlParameter('searchValue', value || '');
  }, [setSearchString]);

  const onSortingChange = useCallback((val: TOption) => {
    setSortingValue(val.id);
    setUrlParameter('sortingValue', val.id);
  }, []);

  const onMobileFilterApply = useCallback((filterState: MyTokensFilterState | null, sorting: SelectOptionProps) => {
    setFilterState(filterState);
    setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
    setSortingValue(sorting.id as string);
    setUrlParameter('sortingValue', sorting.id as string);
  }, []);

  return {
    filterState,
    sortingValue,
    tokensWithOffers,
    featuredTokens,
    featuredTokensForAttributeCounts,
    filterCount,
    myCollections,
    searchString,
    onSearch,
    onSortingChange,
    setFilterState,
    onMobileFilterApply
  };
};
