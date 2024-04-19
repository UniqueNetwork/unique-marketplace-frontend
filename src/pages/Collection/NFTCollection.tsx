import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { Select } from 'components/UI';

import { TokensList } from './TokensList/TokensList';
import { PagePaper } from 'components/PagePaper/PagePaper';
import NoItems from 'components/NoItems';
import SearchField from 'components/SearchField/SearchField';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

import { Filters } from './Filters/Filters';
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { CollectionDetail } from './CollectionDetail/CollectionDetail';
import { useTokens } from 'api/restApi/tokens/tokens';
import InfiniteScroll from 'react-infinite-scroller';
import { useMarketableCollection } from 'api/restApi/collections/collection';
import { MarketableCollection } from 'api/restApi/collections/types';
import { useCollections } from 'hooks/useCollections';
import { useCollectionTokensFilter } from './hooks/useCollectionTokensFilter';
import { TokensFilter } from './Filters/types';
import { RoyaltiesFormData } from 'pages/CollectionEdit/types';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { CollectionPageProps } from './types';
import { MobileFilters } from 'components/Filters/MobileFilter';
import { Address } from '@unique-nft/utils';

export const NFTCollectionPage = ({ collection: collectionOnChain }: CollectionPageProps) => {
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const [collection, setCollection] = useState<MarketableCollection>();
  const deviceSize = useDeviceSize();
  const { getCollectionTokensCount } = useCollections();
  const { fetchCollection, addCollection } = useMarketableCollection();
  const [scanning, setScanning] = useState(false);
  const [tokensCountOnScan, setTokensCountOnScan] = useState(0);
  const collectionId = collectionOnChain.id;

  const { tokens, tokensCount, isFetching, fetchMore, fetch, attributes, attributeCounts } = useTokens({
    collectionId
  });

  const isRFTCollection = collection?.mode === 'ReFungible';

  const { currentChainId, api } = useApi();

  const {
    filterState,
    searchValue,
    sortingValue,
    filterCount,
    onFilterChange,
    onSearch,
    onSortingChange,
    getFilterByState,
    onMobileFilterApply
   } = useCollectionTokensFilter({ isFetching, fetch });

  const [royalties, setRoyalties] = useState<RoyaltiesFormData>();
  const updateRoyalties = useCallback((collectionOnChain: CollectionInfoWithSchemaResponse | null | undefined) => {
    if (collectionOnChain?.schema?.royalties?.length) {
      const royalties = collectionOnChain?.schema?.royalties.map(({ value, address }) => ({
        address,
        value: value
          ? (Number(value) / 100).toFixed(2)
          : '0'
      }));
      setRoyalties({ royalties });
    }
  }, []);

  useEffect(() => {
    if (!api?.collection) return;
    void (async () => {
      const tokensCountOnScan = await getCollectionTokensCount(collectionId);
      setTokensCountOnScan(tokensCountOnScan);

      const collectionData = await fetchCollection(collectionId);
      updateRoyalties(collectionOnChain);

      if (!collectionData || (tokensCountOnScan > 0 && collectionData.tokensCount !== tokensCountOnScan)) {
        void addCollection(collectionId);
        setScanning(tokensCountOnScan > 0);
        setCollection(mapCollectionToMarketable(collectionOnChain, tokensCountOnScan));
        return;
      }
      setCollection(collectionData);
    })();
  }, [currentChainId, collectionId, selectedAccount?.address]);

  useEffect(() => {
    if (!scanning) return;
    const refetchCollection = async () => {
      const collectionData = await fetchCollection(collectionId);
      if (!collectionData) return;
      setCollection(collectionData);
      if (collectionData?.tokensCount === collectionData?.tokensTotal) {
        setScanning(false);

        void fetch({
          page: 1,
          pageSize,
          ...(getFilterByState(filterState)),
          searchText: searchValue || undefined,
          'sort[0]': [sortingValue]
        });
      }
    };

    const intervalId = setInterval(() => void refetchCollection(), 1000);
    return () => clearInterval(intervalId);
  }, [scanning, collectionId, tokensCountOnScan, filterState, sortingValue, searchValue]);

  const hasMore = tokens && tokens.length < tokensCount && !isFetching;

  const onClickSeeMore = useCallback(() => {
    if (!isFetching && hasMore) {
      void fetchMore({
        page: Math.ceil(tokens.length / 20) + 1,
        pageSize,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        'sort[0]': [sortingValue]
      });
    }
  }, [isFetching, tokens.length, getFilterByState, filterState, searchValue, sortingValue]);

  return (<>
    <CollectionDetail collection={collection} royalties={royalties} />
    <CollectionPagePaper>
      <MarketMainPageStyled>
        {deviceSize > DeviceSize.md && <LeftColumn>
          <Filters
            value={filterState}
            attributes={attributes}
            attributeCounts={attributeCounts}
            onFilterChange={onFilterChange}
            testid={`${testid}-filters`}
            disabled={false}
          />
        </LeftColumn>}
        <MainContent>
          <SearchAndSortingWrapper>
            <SearchField
              hideButton
              searchValue={searchValue}
              placeholder='Search for NFTs and attributes'
              onSearch={onSearch}
              testid={`${testid}-search-field`}
            />
            <SortSelectWrapper>
              <Select
                onChange={onSortingChange}
                options={isRFTCollection ? sortingOptions.slice(-2) : sortingOptions}
                value={sortingValue}
                testid={`${testid}-sorting-select`}
              />
            </SortSelectWrapper>
          </SearchAndSortingWrapper>
          <div>
            <Text
              testid={`${testid}-items-count`}
              size='m'
            >{isAccountsLoading ? 'Loading items' : `${tokensCount} items`}</Text>
          </div>
          <InfiniteScroll
            hasMore={hasMore}
            initialLoad={false}
            loadMore={onClickSeeMore}
            pageStart={1}
            threshold={200}
            useWindow={true}
          >
            {!isAccountsLoading && !tokens?.length && <NoItems isSearchResult={!!searchValue || !!filterCount} />}
            <TokensList
              showOwner
              tokens={tokens || []}
              isLoading={isAccountsLoading}
              testid={`${testid}-tokens`}
            />
          </InfiniteScroll>
        </MainContent>
      </MarketMainPageStyled>
      {deviceSize <= DeviceSize.md && <MobileFilters<TokensFilter>
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterApply={onMobileFilterApply}
        testid={`${testid}-mobile-filters`}
        filterComponent={({ filterState: _filterState, onFilterChange: _onFilterChange }) => <Filters
          value={_filterState}
          attributes={attributes}
          attributeCounts={attributeCounts}
          onFilterChange={_onFilterChange}
          testid={`${testid}-filters`}
        />}
      />}
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

const mapCollectionToMarketable = (collection: CollectionInfoWithSchemaResponse, tokensCount: number) => ({
  id: '-',
  data: collection,
  allowedTokens: '',
  isMarketable: false,
  active: true,
  collectionId: collection.id,
  createdAt: '',
  decimalPoints: 0,
  description: collection.description,
  mintMode: false,
  mode: collection.mode,
  name: collection.name,
  network: '',
  owner: collection.owner,
  status: '',
  tokenPrefix: collection.tokenPrefix,
  tokensCount: 0,
  tokensTotal: tokensCount,
  tokensOnMarket: 0,
  updatedAt: '',
  minPrice: 0,
  maxPrice: 0,
  holders: 0,
  uniqueHolders: '0',
  metadata: null
});
