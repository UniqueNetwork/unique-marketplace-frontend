import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import BN from 'bn.js';
import { Text } from '@unique-nft/ui-kit';
import { Button, Select } from 'components/UI';
import { BN_MAX_INTEGER } from '@polkadot/util';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';

import { useOffers } from 'api/restApi/offers/offers';
import { Offer } from 'api/restApi/offers/types';
import { TokensList } from 'components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import NoItems from 'components/NoItems';
import SearchField from 'components/SearchField/SearchField';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { fromStringToBnString } from 'utils/bigNum';
import { setUrlParameter, parseFilterState, stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { useCollections } from 'hooks/useCollections';

import { MobileFilters } from './Filters/MobileFilter';
import { Filters } from './Filters/Filters';
import { CollectionFilterState } from './Filters/types';
import { countTokenAttributes } from './Filters/utils/attributes';
import { TOption } from './types';
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { useParams } from 'react-router-dom';
import { CollectionDetail } from './CollectionDetail/CollectionDetail';
import { MixedTokenAndOffer } from 'pages/MyTokens/NFTPage';

export const CollectionPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const { collectionId } = useParams<{ collectionId: string }>();
  const [filterState, setFilterState] = useState<CollectionFilterState | null>(parseFilterState(searchParams.get('filterState')));
  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || defaultSortingValue.id);
  const [searchString, setSearchString] = useState<string>(searchParams.get('searchValue') || '');
  const [selectOption, setSelectOption] = useState<TOption>();
  const { selectedAccount, isLoading } = useAccounts();
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse>();
  const [tokens, setTokens] = useState<TokenByIdResponse[]>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState<boolean>(true);
  const deviceSize = useDeviceSize();
  const { getCollection } = useCollections();
  const [isFiltersVisible, setIsFilterVisible] = useState(true);

  const { offers, isFetching: isFetchingOffers, fetch } = useOffers();
  const { api, currentChainId } = useApi();

  useEffect(() => {
    if (!api?.nft || !selectedAccount?.address) return;

    setIsFetchingTokens(true);
    void (async () => {
      const collection = await getCollection(Number(collectionId));
      if (!collection) return; // TODO redirect to 404
      setCollection(collection);

      await fetch({ page: 1, pageSize, collectionId: Number(collectionId) });
      const _tokens = (await api.nft?.getTokensOfCollection(Number(collectionId), selectedAccount.address)) || [];

      setTokens(_tokens);
      setIsFetchingTokens(false);
    })();
  }, [api?.nft, currentChainId, collectionId, setIsFetchingTokens, fetch, selectedAccount, getCollection]);

  useEffect(() => {
    if (!api) return;
    // clear filters and searchString if chainId has been changed
    setFilterState(null);
    setSearchString('');
    setSortingValue(defaultSortingValue.id);
  }, [currentChainId]);

  useEffect(() => {
    if (isFetchingTokens) return;
    setFilterState((filter) => filter
      ? {
        ...filter,
        attributeCounts: [],
        attributes: []
      }
      : null
    );
  }, [selectedAccount]);

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

  // attribute counts calculated based on tokens filtered by all filters except attribute count filter
  const filterForAttributeCounts = useCallback((token: MixedTokenAndOffer) => {
      const { statuses, prices } = filterState || {};
      setUrlParameter('filterState', filterState ? JSON.stringify(filterState) : '');
      const filterByStatus = (token: MixedTokenAndOffer) => {
        const { onSell, fixedPrice, timedAuction, notOnSale } = statuses || {};
        if (!onSell && !fixedPrice && !timedAuction && !notOnSale) return true;
        return (onSell && !fixedPrice && !timedAuction && !!token.seller) ||
          (fixedPrice && !!token.seller && !token.auction) ||
          (timedAuction && !!token.seller && !!token.auction) ||
          (notOnSale && !token.seller);
      };

      let filteredByPrice = true;
      if (prices?.minPrice || prices?.maxPrice) {
        if (!token.price) {
          filteredByPrice = false;
        } else {
          const tokenPrice = new BN(token.price.raw);
          const minPrice = new BN(fromStringToBnString(prices.minPrice || '0', api?.market?.decimals));
          const maxPrice = prices.maxPrice ? new BN(fromStringToBnString(prices.maxPrice, api?.market?.decimals)) : BN_MAX_INTEGER;
          filteredByPrice = (tokenPrice.gte(minPrice) && tokenPrice.lte(maxPrice));
        }
      }
      const filteredByAttributes = true;
      // if (filterState?.attributes && filterState.attributes.length > 0) {
      //   filteredByAttributes = filterState?.attributes.every((attributeItem) => {
      //     const attribute = Object.values(token.attributes || {}).find((attribute) => attribute.name._.toLowerCase() === attributeItem.key.toLowerCase());
      //     return (attribute && attribute.isArray)
      //       ? (attribute.value as (BoxedNumberWithDefault | LocalizedStringWithDefault)[])
      //         .some((_attribute) => _attribute._ === attributeItem.attribute)
      //       : ((attribute?.value as LocalizedStringWithDefault)?._ === attributeItem.attribute);
      //   });
      // }
      let filteredBySearchValue = true;
      if (searchString) {
        filteredBySearchValue = token.tokenId === Number(searchString);
      }

      return filterByStatus(token) && filteredByPrice && filteredByAttributes && filteredBySearchValue;
    },
    [filterState, searchString, api?.market?.decimals]
  );

  const filterByAttributeCounts = useCallback((token: MixedTokenAndOffer) => {
    let filteredByAttributeCounts = true;
    if (filterState?.attributeCounts && filterState.attributeCounts.length > 0) {
      filteredByAttributeCounts = filterState?.attributeCounts.some((attributeCount) => {
        return countTokenAttributes(token.attributes) === attributeCount;
      });
    }
    return filteredByAttributeCounts;
  }, [filterState]);

  const tokensWithOffers: MixedTokenAndOffer[] = useMemo(() => {
    return [
      ...(offers?.map<MixedTokenAndOffer>((offer) => ({
        id: offer.tokenId,
        image: stringToDecodedInfixOrUrlOrCidAndHash(offer.tokenDescription?.image),
        attributes: offer.tokenDescription?.attributes,
        video: stringToDecodedInfixOrUrlOrCidAndHash(offer.tokenDescription?.video),
        owner: offer.seller,
        ...offer
      })) || []),
      ...tokens
    ];
  }, [tokens, offers]);

  const featuredTokensForAttributeCounts: MixedTokenAndOffer[] = useMemo(() => {
    return tokensWithOffers.filter(filterForAttributeCounts);
  }, [tokensWithOffers, filterForAttributeCounts]);

  const featuredTokens: MixedTokenAndOffer[] = useMemo(() => {
    const filteredTokens: MixedTokenAndOffer[] = featuredTokensForAttributeCounts.filter(filterByAttributeCounts);

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

  const onFiltersVisibleToggle = useCallback(() => setIsFilterVisible(!isFiltersVisible), [isFiltersVisible]);

  return (<>
    <CollectionDetail collection={collection} />
    <CollectionPagePaper>
      <SearchAndSortingWrapper>
        <FiltersToggleWrapper>
          <Button
            role={'tertiary'}
            iconLeft={{ name: isFiltersVisible ? 'arrow-left' : 'filters', size: 24 }}
            title='Filters'
            onClick={onFiltersVisibleToggle}
          />
          <Text>{featuredTokens.length} results</Text>
        </FiltersToggleWrapper>
        <SearchField
          searchValue={searchString}
          placeholder='Token'
          onSearch={onSearch}
          testid={`${testid}-search-field`}
        />
        <SortSelectWrapper>
          <Select
            onChange={onSortingChange}
            options={sortingOptions}
            value={sortingValue}
            testid={`${testid}-sorting-select`}
          />
        </SortSelectWrapper>
      </SearchAndSortingWrapper>
      <MarketMainPageStyled>
        <LeftColumn isVisible={isFiltersVisible} >
          {deviceSize !== DeviceSize.md &&
          <Filters
            value={filterState}
            onFilterChange={setFilterState}
            tokens={tokensWithOffers}
            featuredTokens={featuredTokens}
            isFetchingTokens={isFetchingTokens}
            testid={`${testid}-filters`}
            featuredTokensForAttributeCounts={featuredTokensForAttributeCounts}
          />
          }
        </LeftColumn>
        <MainContent>
          <div>
            <Text
              testid={`${testid}-items-count`}
              size='m'
            >{isFetchingTokens || isFetchingOffers || isLoading ? 'Loading items' : `${featuredTokens.length} items`}</Text>
          </div>
          <TokensListWrapper >
            {!isFetchingTokens && !isFetchingOffers && !isLoading && featuredTokens.length === 0 && <NoItems isSearchResult={!!searchString || !!filterCount} />}
            <TokensList testid={`${testid}-tokens`} tokens={featuredTokens} isLoading={isFetchingTokens || isFetchingOffers || isLoading} />
          </TokensListWrapper>
        </MainContent>
        {deviceSize <= DeviceSize.md && <MobileFilters
          filterCount={filterCount}
          defaultSortingValue={defaultSortingValue}
          sortingValue={sortingValue}
          sortingOptions={sortingOptions}
          onFilterChange={setFilterState}
          onSortingChange={onSortingChange}
          testid={`${testid}-mobile-filters`}
          filterComponent={<Filters
            value={filterState}
            onFilterChange={setFilterState}
            testid={`${testid}-filters`}
            tokens={tokensWithOffers}
            featuredTokens={featuredTokens}
            isFetchingTokens={isFetchingTokens}
            featuredTokensForAttributeCounts={featuredTokensForAttributeCounts}
          />}
        />}
      </MarketMainPageStyled>
    </CollectionPagePaper>
  </>);
};

const CollectionPagePaper = styled(PagePaper)`
  && {
    margin-top: calc(var(--gap) / 2);
  }
`;

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
`;

const LeftColumn = styled.div<{ isVisible?: boolean }>`
  margin-right: calc(var(--gap) * 2);
  display: ${({ isVisible }) => isVisible ? 'unset' : 'none'};
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MainContent = styled.div`
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
  margin-bottom: var(--gap);
  display: flex;
  justify-content: space-between;
`;

const TokensListWrapper = styled.div`
  min-height: 640px;
`;

const FiltersToggleWrapper = styled.div`
  display: flex;
  width: 235px;
  margin-right: calc(var(--gap) * 2);
  gap: var(--gap);
  align-items: center;
`;
