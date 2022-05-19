import React, { FC, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Button, InputText, Pagination } from '@unique-nft/ui-kit';
import { SortQuery } from '@unique-nft/ui-kit/dist/cjs/types';
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
  const [searchValue, setSearchValue] = useState<string | number>();

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

  const onSearch = useCallback(() => {
    fetch({ sort: sortString, pageSize, page: 1, searchText: searchValue?.toString() });
  }, [sortString, pageSize, searchValue]);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchValue(value);
  }, [setSearchValue]);

  const onSearchInputKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    onSearch();
  }, [onSearch]);

  const onPageChange = useCallback((newPage: number) => {
    if ((currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) || page === newPage) return;
    setPage(newPage);
    fetch({
      page: newPage + 1,
      pageSize,
      sort: sortString,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined,
      searchText: searchValue?.toString()
    });
  }, [selectedAccount?.address, page, fetch, sortString, searchValue]);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    if (currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) return;
    setPageSize(newPageSize);
    setPage(0);
    fetch({
      page: 1,
      pageSize: newPageSize,
      sort: sortString,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, page, fetch, sortString]);

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
    fetch({ page: 1, pageSize, sort: sortString, searchText: searchValue?.toString() });
  }, [fetch, setSortString, pageSize, searchValue]);

  return (<PagePaper>
    <TradesPageWrapper>
      <StyledSearchField
        searchValue={searchValue}
        placeholder='Collection / token'
        onSearchStringChange={onSearchStringChange}
        onSearchInputKeyDown={onSearchInputKeyDown}
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
