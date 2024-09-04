import { useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import { Select, Text } from 'components/UI';
import { Filters } from '../../components';
import { useOffers } from '../../api/restApi/offers/offers';
import { OffersList } from '../../components/OffersList/OffersList';
import { MobileFilters } from '../../components/Filters/MobileFilter';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import NoItems from '../../components/NoItems';
import { useAccounts } from '../../hooks/useAccounts';
import SearchField from '../../components/SearchField/SearchField';
import useDeviceSize, { DeviceSize } from '../../hooks/useDeviceSize';
import { useCollections } from 'hooks/useCollections';
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { useMarketFilter } from './hooks/useMarketFilter';
import { BannerSlider } from 'components/BannerSlider/BannerSlider';
import { Slide } from 'components/BannerSlider/Slide';
import { useGetBanners } from 'api/restApi/banners/banners';
import Skeleton from 'components/Skeleton/Skeleton';
import { useOffersAttributes } from 'api/restApi/offers/offersAttributes';

export const MarketPage = () => {
  const { offers, offersCount, isFetching, fetchMore, fetch } = useOffers();
  const { attributes, attributeCounts, isFetchingAttributes, fetchAttributes } = useOffersAttributes();
  const { isFetching: isFetchingCollections } = useCollections();
  const { isLoading: isAccountsLoading } = useAccounts();
  const { banners, isFetching: isFetchingBanners } = useGetBanners();
  const deviceSize = useDeviceSize();

  const {
    filterState,
    searchValue,
    sortingValue,
    filterCount,
    onSearch,
    onSortingChange,
    onFilterChange,
    getFilterByState,
    onMobileFilterApply
  } = useMarketFilter({ isFetching, fetch, fetchAttributes });

  const hasMore = offers && offers.length < offersCount;

  const onClickSeeMore = useCallback(() => {
    if (!isFetching) {
      void fetchMore({
        page: Math.ceil(offers.length / pageSize) + 1,
        pageSize,
        ...(getFilterByState(filterState)),
        searchText: searchValue || undefined,
        sort: [sortingValue]
      });
    }
  }, [fetchMore, offers, pageSize, isFetching, searchValue, filterState]);

  const isLoading = isAccountsLoading || isFetching || isFetchingCollections;

  return (<>
    {isFetchingBanners && <Skeleton height={600} />}
    {!isFetchingBanners && banners.length > 0 && <BannerSlider >
      {banners.map((banner, index) => (
        <Slide key={index}
          {...banner}
        />
      ))}
    </BannerSlider>}
    <PagePaper>
      <MarketMainPageStyled>
        <LeftColumn>
          {deviceSize !== DeviceSize.md && <Filters
            value={filterState}
            attributes={attributes}
            attributeCounts={attributeCounts}
            onFilterChange={onFilterChange}
            testid={`${testid}-filters`}
          />}
        </LeftColumn>
        <MainContent>
          <SearchAndSortingWrapper>
            <SearchField
              hideButton
              searchValue={searchValue}
              placeholder='Search for collections, NFTs and attributes'
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
          {!!filterCount && <div>
            <Text
              testid={`${testid}-items-count`}
              size='m'
            >{isLoading ? 'Loading items' : `${offersCount} items`}</Text>
          </div>}
          {
            isFetchingAttributes ? (
              <OffersList offers={[]} isLoading={true} testid={`${testid}-offers-attr-load`} />
            ) : (
              <InfiniteScroll
                hasMore={hasMore}
                initialLoad={false}
                loadMore={onClickSeeMore}
                pageStart={1}
                threshold={200}
                useWindow={true}
              >
                {!isLoading && !offers?.length && <NoItems isSearchResult={!!searchValue || !!filterCount} />}
                <OffersList offers={offers || []} isLoading={isLoading} testid={`${testid}-offers`} />
              </InfiniteScroll>
            )
          }
        </MainContent>
      </MarketMainPageStyled>
      {deviceSize <= DeviceSize.md && <MobileFilters
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterApply={onMobileFilterApply}
        testid={`${testid}-mobile-filters`}
        filterComponent={({ filterState, onFilterChange }) => <Filters
          value={filterState}
          attributes={attributes}
          attributeCounts={attributeCounts}
          onFilterChange={onFilterChange}
          testid={`${testid}-filters`}
        />}
      />}
    </PagePaper>
  </>);
};

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
`;

const LeftColumn = styled.div`
  padding-right: 24px;
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MainContent = styled.div`
  position: relative;
  padding-left: calc(var(--prop-gap) * 2);
  flex: 1;

  > div:nth-of-type(2) {
    margin-top: var(--prop-gap);
    margin-bottom: calc(var(--prop-gap) * 2);
  }

  @media (max-width: 1024px) {
    padding-left: 0;
  }
`;

const SortSelectWrapper = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }

  .unique-select svg {
    z-index: 0;
  }
`;

const SearchAndSortingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
