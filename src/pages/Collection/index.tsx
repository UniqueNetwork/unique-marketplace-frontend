import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import { MobileFilters } from './Filters/MobileFilter';
import { Filters } from './Filters/Filters';
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { useNavigate, useParams } from 'react-router-dom';
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
import { formatKsm } from 'api/chainApi/utils/textFormat';
import { BN } from '@polkadot/util';

export const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const [collection, setCollection] = useState<MarketableCollection>();
  const deviceSize = useDeviceSize();
  const { getCollectionTokensCount } = useCollections();
  const { fetchCollection, addCollection } = useMarketableCollection();
  const [scanning, setScanning] = useState(false);
  const [tokensCountOnScan, setTokensCountOnScan] = useState(0);
  const navigate = useNavigate();

  const { tokens, tokensCount, isFetching, fetchMore, fetch, attributes, attributeCounts } = useTokens({
    collectionId: Number(collectionId)
  });

  const { currentChainId, api } = useApi();

  const {
    filterState,
    searchValue,
    sortingValue,
    filterCount,
    onFilterChange,
    onSearch,
    onSortingChange,
    getFilterByState
   } = useCollectionTokensFilter({ isFetching, fetch });

  const [royalty, setRoyalty] = useState<RoyaltiesFormData>();
  const setRoyalties = useCallback((collectionOnChain: CollectionInfoWithSchemaResponse | null | undefined) => {
    if (collectionOnChain?.schema?.royalties?.length) {
      const value = collectionOnChain.schema.royalties[0]?.value
        ? (Number(collectionOnChain.schema.royalties[0]?.value) / 100).toFixed(2)
        : '0';
      const address = collectionOnChain.schema.royalties[0]?.address;
      setRoyalty({
        value,
        address
      });
    }
  }, []);

  useEffect(() => {
    const id = Number(collectionId);
    void (async () => {
      const tokensCountOnScan = await getCollectionTokensCount(id);
      setTokensCountOnScan(tokensCountOnScan);

      const collectionData = await fetchCollection(id);
      const collection = await api?.collection?.getCollection(Number(collectionId));
      setRoyalties(collection);
      if (!collectionData || (tokensCountOnScan > 0 && collectionData.tokensCount !== tokensCountOnScan)) {
        if (!collection) return navigate('/404');
        void addCollection(id);
        setScanning(tokensCountOnScan > 0);
        setCollection({
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
          tokensTotal: tokensCountOnScan,
          tokensOnMarket: 0,
          updatedAt: '',
          minPrice: 0,
          maxPrice: 0,
          holders: 0,
          uniqueHolders: '0',
          metadata: null
        });
        return;
      }
      setCollection(collectionData);
    })();
  }, [currentChainId, collectionId, fetch, selectedAccount?.address]);

  useEffect(() => {
    if (!scanning) return;
    const refetchCollection = async () => {
      const collectionData = await fetchCollection(Number(collectionId));
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

  const hasMore = tokens && tokens.length < tokensCount;

  const onClickSeeMore = useCallback(() => {
    if (!isFetching) {
      void fetchMore({
        page: Math.ceil(tokens.length / pageSize) + 1,
        pageSize: 20,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        'sort[0]': [sortingValue]
      });
    }
  }, [fetchMore, tokens, pageSize, isFetching, searchValue, filterState]);

  return (<>
    <CollectionDetail collection={collection} royalty={royalty} />
    <CollectionPagePaper>
      <MarketMainPageStyled>
        <LeftColumn>
          <Filters
            value={filterState}
            attributes={attributes}
            attributeCounts={attributeCounts}
            onFilterChange={onFilterChange}
            testid={`${testid}-filters`}
            disabled={scanning}
          />
        </LeftColumn>
        <MainContent>
          <SearchAndSortingWrapper>
            <SearchField
              searchValue={searchValue}
              placeholder='Token / attribute'
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
            <TokensList tokens={tokens || []} isLoading={isAccountsLoading} testid={`${testid}-tokens`} />
          </InfiniteScroll>
        </MainContent>
      </MarketMainPageStyled>
      {deviceSize <= DeviceSize.md && <MobileFilters<TokensFilter>
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterChange={onFilterChange}
        onSortingChange={onSortingChange}
        testid={`${testid}-mobile-filters`}
        filterComponent={<Filters
          value={filterState}
          attributes={attributes}
          attributeCounts={attributeCounts}
          onFilterChange={onFilterChange}
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
