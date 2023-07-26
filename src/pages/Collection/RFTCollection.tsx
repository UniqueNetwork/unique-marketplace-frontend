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
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { CollectionDetail } from './CollectionDetail/CollectionDetail';
import InfiniteScroll from 'react-infinite-scroller';
import { useMarketableCollection } from 'api/restApi/collections/collection';
import { MarketableCollection } from 'api/restApi/collections/types';
import { useCollections } from 'hooks/useCollections';
import { TokensFilter } from './Filters/types';
import { RoyaltiesFormData } from 'pages/CollectionEdit/types';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { CollectionPageProps, TOption } from './types';
import { useGetTokens } from './hooks/useGetTokens';
import { setUrlParameter } from 'utils/helpers';
import { noop } from '@polkadot/util';

export const RFTCollectionPage = ({ collection: collectionOnChain }: CollectionPageProps) => {
  const [collection, setCollection] = useState<MarketableCollection>();
  const deviceSize = useDeviceSize();
  const { getCollectionTokensCount } = useCollections();
  const { fetchCollection, addCollection } = useMarketableCollection();
  const [tokensCountOnScan, setTokensCountOnScan] = useState(0);
  const searchParams = new URLSearchParams(window.location.search);

  const collectionId = collectionOnChain.id;

  const { tokens, total, fetchTokens, isFetching } = useGetTokens({ collectionId });

  const { currentChainId, api } = useApi();

  const [sortingValue, setSortingValue] = useState<string>(searchParams.get('sortingValue') || 'asc(TokenId)');
  const [searchValue, setSearchValue] = useState<string | undefined>(searchParams.get('searchValue') || '');

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
    if (!api?.collection) return;
    void (async () => {
      const tokensCountOnScan = await getCollectionTokensCount(collectionId);
      setTokensCountOnScan(tokensCountOnScan);

      const collectionData = await fetchCollection(collectionId);
      setRoyalties(collectionOnChain);
      void fetchTokens({
        page: 1,
        pageSize,
        searchText: undefined,
        sort: sortingValue
      });
      if (!collectionData) {
        void addCollection(collectionId);
        setCollection(mapCollectionToMarketable(collectionOnChain, tokensCountOnScan));
        return;
      }
      setCollection({ ...collectionData, tokensCount: tokensCountOnScan });
      setSortingValue(sortingOptions[4].id);
    })();
  }, [currentChainId, collectionId]);

  const hasMore = tokens && tokens.length < total && !isFetching;

  const onClickSeeMore = useCallback(() => {
    if (!isFetching && hasMore) {
      void fetchTokens({
        page: Math.ceil(tokens.length / pageSize) + 1,
        pageSize,
        searchText: searchValue || undefined,
        sort: sortingValue
      });
    }
  }, [isFetching, tokens.length, searchValue, sortingValue]);

  const onSortingChange = useCallback((value: TOption) => {
    setSortingValue(value.id);
    setUrlParameter('sortingValue', value.id);
    window.scrollTo({ top: 0 });
    void fetchTokens({
      page: 1,
      pageSize,
      searchText: searchValue || undefined,
      sort: value.id
    });
  }, [fetch, searchValue]);

  const onSearch = useCallback((value?: string) => {
    setSearchValue(value);
    setUrlParameter('searchValue', value || '');
    void fetchTokens({
      page: 1,
      pageSize,
      searchText: value || undefined,
      sort: sortingValue
    });
  }, [fetch, sortingValue, searchValue]);

  return (<>
    <CollectionDetail collection={collection} royalty={royalty} />
    <CollectionPagePaper>
      <MarketMainPageStyled>
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
                options={sortingOptions.slice(-2)}
                value={sortingValue}
                testid={`${testid}-sorting-select`}
              />
            </SortSelectWrapper>
          </SearchAndSortingWrapper>
          <div>
            <Text
              testid={`${testid}-items-count`}
              size='m'
            >{isFetching ? 'Loading items' : `${total} items`}</Text>
          </div>
          <InfiniteScroll
            hasMore={hasMore}
            initialLoad={false}
            loadMore={onClickSeeMore}
            pageStart={1}
            threshold={200}
            useWindow={true}
          >
            {!isFetching && !tokens?.length && <NoItems isSearchResult={!!searchValue} />}
            <TokensList
              showOwner={false}
              tokens={tokens || []}
              isLoading={isFetching}
              testid={`${testid}-tokens`}
            />
          </InfiniteScroll>
        </MainContent>
      </MarketMainPageStyled>
      {deviceSize <= DeviceSize.md && <MobileFilters<TokensFilter>
        filterCount={0}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterChange={noop}
        onSortingChange={onSortingChange}
        testid={`${testid}-mobile-filters`}
        filterComponent={null}
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
  tokensCount,
  tokensTotal: tokensCount,
  tokensOnMarket: 0,
  updatedAt: '',
  minPrice: 0,
  maxPrice: 0,
  holders: 0,
  uniqueHolders: '0',
  metadata: null
});
