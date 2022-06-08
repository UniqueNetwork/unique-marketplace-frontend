import React, { FC, useCallback, useEffect, useState } from 'react';
import { Pagination, SortQuery } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { useTrades } from '../../api/restApi/trades/trades';
import { Table } from '../../components/Table';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { tradesColumns } from './columns';
import { useAccounts } from '../../hooks/useAccounts';
import { useGetTokensByTrades } from './hooks/useGetTokensByTrades';
import { TradesTabs } from './types';
import SearchField from '../../components/SearchField/SearchField';

type TokensTradesPage = {
  currentTab: TradesTabs
}

export const TokensTradesPage: FC<TokensTradesPage> = ({ currentTab }) => {
  const { selectedAccount, isLoading: isLoadingAccounts } = useAccounts();
  const [page, setPage] = useState<number>(0);
  const [sortString, setSortString] = useState<string>();
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>();

  const { trades, tradesCount, fetch, isFetching } = useTrades();
  const { tradesWithTokens, isFetchingTokens } = useGetTokensByTrades(trades);

  useEffect(() => {
    if (isLoadingAccounts || (currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address)) return;
    setSearchValue(undefined);
    fetch({
      page: 1,
      pageSize,
      sort: sortString,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [currentTab, selectedAccount?.address, sortString, isLoadingAccounts]);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    fetch({
      page: 1,
      pageSize,
      sort: sortString,
      searchText: value,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, sortString, pageSize]);

  const onPageChange = useCallback((newPage: number) => {
    if ((currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) || page === newPage) return;
    setPage(newPage);
    fetch({
      page: newPage + 1,
      pageSize,
      sort: sortString,
      searchText: searchValue,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, page, sortString, searchValue, pageSize]);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    if (currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) return;
    setPageSize(newPageSize);
    setPage(0);
    fetch({
      page: 1,
      pageSize: newPageSize,
      sort: sortString,
      searchText: searchValue,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, page, sortString, searchValue]);

  const onSortChange = useCallback((newSort: SortQuery) => {
    let sortString;
    switch (newSort.mode) {
      case 2:
        sortString = 'asc';
        break;
      case 1:
        sortString = 'desc';
        break;
      case 0:
      default:
        sortString = undefined;
        break;
    }
    const associatedSortValues: Record<string, string> = {
      price: 'Price',
      token: 'TokenId',
      collection: 'CollectionId',
      tradeDate: 'TradeDate'
    };

    if (sortString && sortString.length) sortString += `(${associatedSortValues[newSort.field]})`;
    setSortString(sortString);
    fetch({
      page: 1,
      pageSize,
      sort: sortString,
      searchText: searchValue,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, setSortString, pageSize, searchValue]);

  return (<PagePaper>
    <TradesPageWrapper>
      <StyledSearchField
        searchValue={searchValue}
        placeholder='Collection / token'
        onSearch={onSearch}
      />
      <StyledTable
        onSort={onSortChange}
        data={tradesWithTokens || []}
        columns={tradesColumns}
        loading={isLoadingAccounts || isFetching || isFetchingTokens}
      />
      {!!tradesCount && <PaginationWrapper>
        <Pagination
          size={tradesCount}
          current={page}
          withPerPageSelector
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          withIcons
        />
      </PaginationWrapper>}
    </TradesPageWrapper>
  </PagePaper>);
};

const TradesPageWrapper = styled.div`
  width: 100%
`;

const StyledSearchField = styled(SearchField)`
  margin-bottom: calc(var(--gap) * 2);
`;

const StyledTable = styled(Table)`
  && > div > div:first-child {
    grid-column: 1 / span 2;
    & > .unique-text {
      display: none;
    }
  }
`;

const PaginationWrapper = styled.div`
  margin-top: calc(var(--gap) * 2);
  
  .unique-pagination-wrapper {
    justify-content: space-between;
  }
  
  @media (max-width: 568px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
