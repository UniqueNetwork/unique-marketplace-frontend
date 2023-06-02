import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { Select } from 'components/UI';

import { useOffers } from 'api/restApi/offers/offers';
import { PagePaper } from 'components/PagePaper/PagePaper';
import NoItems from 'components/NoItems';
import SearchField from 'components/SearchField/SearchField';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

import { MobileFilters } from './Filters/MobileFilter';
import { Filters } from './Filters/Filters';
import { defaultSortingValue, pageSize, sortingOptions, testid } from './constants';
import { useMyTokensFilter } from './hooks/useMyTokensFilter';
import { useGetMyTokens } from './hooks/useGetMyTokens';
import { TokensList } from 'components';
import { Address } from '@unique-nft/utils';

export const NFTPage = () => {
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const deviceSize = useDeviceSize();

  const { offers, isFetching: isFetchingOffers, fetch } = useOffers();
  const { api, currentChainId } = useApi();
  const { tokens, fetchMyTokens, isFetching: isFetchingTokens } = useGetMyTokens();

  useEffect(() => {
    if (!api?.nft || !selectedAccount || isAccountsLoading) return;
    void (async () => {
      await fetch({ page: 1,
        pageSize,
        seller: Address.is.ethereumAddressInAnyForm(selectedAccount.address)
        ? Address.normalize.ethereumAddress(selectedAccount.address)
        : selectedAccount.address
      });
      await fetchMyTokens(selectedAccount);
    })();
  }, [api?.nft, currentChainId, selectedAccount?.address]);

  const {
    filterState,
    sortingValue,
    searchString,
    filterCount,
    featuredTokens,
    tokensWithOffers,
    featuredTokensForAttributeCounts,
    myCollections,
    onSearch,
    onSortingChange,
    setFilterState
  } = useMyTokensFilter({
    offers,
    tokens,
    isFetchingTokens
  });

  return (<PagePaper>
    <MarketMainPageStyled>
      <LeftColumn>
        {deviceSize !== DeviceSize.md &&
          <Filters
            value={filterState}
            onFilterChange={setFilterState}
            tokens={tokensWithOffers}
            featuredTokens={featuredTokens}
            collections={myCollections}
            isFetchingTokens={isFetchingTokens}
            testid={`${testid}-filters`}
            featuredTokensForAttributeCounts={featuredTokensForAttributeCounts}
          />
        }
      </LeftColumn>
      <MainContent>
        <SearchAndSortingWrapper>
          <SearchField
            searchValue={searchString}
            placeholder='Collection / token'
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
          >{isFetchingTokens || isFetchingOffers || isAccountsLoading ? 'Loading items' : `${featuredTokens.length} items`}</Text>
        </div>
        <TokensListWrapper >
          {!isFetchingTokens && !isFetchingOffers && !isAccountsLoading && featuredTokens.length === 0 && <NoItems isSearchResult={!!searchString || !!filterCount} />}
          <TokensList
            testid={`${testid}-tokens`}
            tokens={featuredTokens}
            isLoading={isFetchingTokens || isFetchingOffers || isAccountsLoading}
          />
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
          collections={myCollections}
          isFetchingTokens={isFetchingTokens}
          featuredTokensForAttributeCounts={featuredTokensForAttributeCounts}
        />}
      />}
    </MarketMainPageStyled>
  </PagePaper>);
};

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
`;

const LeftColumn = styled.div`
  padding-right: 24px;
  border-right: 1px solid var(--grey-300);
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MainContent = styled.div`
  padding-left: 32px;
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
  display: flex;
  justify-content: space-between;
`;

const TokensListWrapper = styled.div`
  min-height: 640px;
`;
