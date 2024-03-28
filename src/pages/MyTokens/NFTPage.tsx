import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, Pagination, Select, Text } from 'components/UI';

import { useOffers } from 'api/restApi/offers/offers';
import { PagePaper } from 'components/PagePaper/PagePaper';
import NoItems from 'components/NoItems';
import SearchField from 'components/SearchField/SearchField';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

import { Filters } from './Filters/Filters';
import { defaultSortingValue, sortingOptions, testid } from './constants';
import { useMyTokensFilter } from './hooks/useMyTokensFilter';
import { useGetMyTokens } from './hooks/useGetMyTokens';
import { TokensList } from 'components';
import { Address } from '@unique-nft/utils';
import { MobileFilters } from 'components/Filters/MobileFilter';
import { MyTokensFilterState } from './Filters/types';
import { useNavigate } from 'react-router-dom';

export const NFTPage = () => {
  const { selectedAccount, isLoading: isAccountsLoading } = useAccounts();
  const deviceSize = useDeviceSize();

  const { offers, isFetching: isFetchingOffers, fetch } = useOffers();
  const { api, currentChainId } = useApi();
  const { tokens, fetchMyTokens, isFetching: isFetchingTokens } = useGetMyTokens();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    if (!api?.nft || !selectedAccount || isAccountsLoading) return;
    void (async () => {
      await fetch({ page: 1,
        pageSize: 1000000,
        seller: Address.is.ethereumAddressInAnyForm(selectedAccount.address)
        ? Address.normalize.ethereumAddress(selectedAccount.address)
        : Address.normalize.substrateAddress(selectedAccount.address) });
      await fetchMyTokens(selectedAccount);
    })();
  }, [api?.nft, currentChainId, selectedAccount?.address, isAccountsLoading]);

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
    setFilterState,
    onMobileFilterApply
  } = useMyTokensFilter({
    offers,
    tokens,
    isFetchingTokens
  });

  useEffect(() => {
    setPageSize(deviceSize === DeviceSize.xl ? 21 : 20);
  }, [deviceSize]);

  const onCreateTokenClick = useCallback(() => {
    navigate(`/${currentChainId}/create-token`);
  }, [currentChainId]);

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
            hideButton
            searchValue={searchString}
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

          <ButtonsWrapper>
            <Button role='primary' title={'Create an NFT'} onClick={onCreateTokenClick}/>
          </ButtonsWrapper>
        </SearchAndSortingWrapper>
        <PaginationWrapper>
          {isFetchingTokens || isFetchingOffers || isAccountsLoading
            ? <Text
                testid={`${testid}-items-count`}
                size='m'
            >Loading items</Text>
            : <>
              <Text
                testid={`${testid}-items-count`}
                size='m'
              >
                {featuredTokens.length} items
              </Text>
              {pageSize < featuredTokens.length && <Pagination
                size={featuredTokens.length}
                perPage={pageSize}
                pageSizes={[20, 21]}
                current={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />}
            </>
          }
        </PaginationWrapper>
        <TokensListWrapper >
          {!isFetchingTokens && !isFetchingOffers && !isAccountsLoading && featuredTokens.length === 0 && <NoItems isSearchResult={!!searchString || !!filterCount} />}
          <TokensList
            testid={`${testid}-tokens`}
            tokens={useMemo(() => featuredTokens.slice(currentPage * pageSize, (currentPage + 1) * pageSize), [currentPage, pageSize, featuredTokens])}
            isLoading={isFetchingTokens || isFetchingOffers || isAccountsLoading}
          />
        </TokensListWrapper>
        <PaginationWrapper>
          {!(isFetchingTokens || isFetchingOffers || isAccountsLoading) && <>
            <Text
              testid={`${testid}-items-count`}
              size='m'
            >
              {featuredTokens.length} items
            </Text>
            {pageSize < featuredTokens.length && <Pagination
              size={featuredTokens.length}
              perPage={pageSize}
              current={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizes={[20, 21]}
            />}
          </>}
        </PaginationWrapper>
      </MainContent>
      {deviceSize <= DeviceSize.md && <MobileFilters<MyTokensFilterState>
        filterCount={filterCount}
        defaultSortingValue={defaultSortingValue}
        sortingValue={sortingValue}
        sortingOptions={sortingOptions}
        onFilterApply={onMobileFilterApply}
        testid={`${testid}-mobile-filters`}
        filterComponent={({ filterState, onFilterChange }) => <Filters
          value={filterState}
          onFilterChange={onFilterChange}
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

  .unique-pagination-wrapper {
    justify-content: space-between;
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
  gap: var(--prop-gap);
  div:first-child {
    margin-right: 0px;
  }
`;

const TokensListWrapper = styled.div`
  min-height: 640px;
  margin-bottom: calc(var(--prop-gap) * 2);
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 2);
  
  @media (max-width: 1279px) {
    .unique-button.size-middle {
      padding: 8px 29px;
    }
    button:last-of-type {
      width: 228px;
    }
  }

  @media (max-width: 567px) {
    flex-direction: column;
    gap: calc(var(--prop-gap) / 2);
    button:last-of-type {
      width: 100%;
    }
  }
`;
