import React, { FC, useCallback, useEffect, useState } from 'react';
import { Pagination, Text } from '@unique-nft/ui-kit';
import { SortQuery } from '@unique-nft/ui-kit/dist/cjs/types';

import { useTrades } from '../../api/restApi/trades/trades';
import styled from 'styled-components';
import { Table } from '../../components/Table';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { tradesColumns } from './columns';
import { useAccounts } from '../../hooks/useAccounts';
import { useGetTokensByTrades } from './hooks/useGetTokensByTrades';
import { TradesTabs } from './types';

type TokensTradesPage = {
  currentTab: TradesTabs
}

export const TokensTradesPage: FC<TokensTradesPage> = ({ currentTab }) => {
  const { selectedAccount } = useAccounts();
  const [page, setPage] = useState<number>(0);
  const [sortString, setSortString] = useState<string>();
  const [pageSize, setPageSize] = useState<number>(10);
  // const [searchValue, setSearchValue] = useState<string | number>();

  const { trades, tradesCount, fetch, isFetching } = useTrades();
  const { tradesWithTokens, isFetchingTokens } = useGetTokensByTrades(trades);

  useEffect(() => {
    if (currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) return;
    fetch({
      page: 1,
      pageSize,
      sort: sortString,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, fetch, currentTab, pageSize]);

  // const onSearch = useCallback(() => {
  //   // TODO: not implemented in api
  //   // fetch({ sortString, pageSize, page: 1, searchText: searchValue?.toString() });
  // }, [sortString, pageSize, searchValue]);

  const onPageChange = useCallback((newPage: number) => {
    if ((currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) || page === newPage) return;
    setPage(newPage);
    fetch({
      page: newPage + 1,
      pageSize,
      sort: sortString,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, page, fetch, sortString, pageSize]);

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
    fetch({ page: 1, pageSize, sort: sortString });
  }, [fetch, setSortString, pageSize]);

  return (<PagePaper>
    <TradesPageWrapper>
      {/* <SearchWrapper> */}
      {/*  <InputText */}
      {/*    iconLeft={{ name: 'magnify', size: 16 }} */}
      {/*    onChange={(val) => setSearchValue(val)} */}
      {/*    placeholder='Collection / token' */}
      {/*    value={searchValue?.toString()} */}
      {/*  /> */}
      {/*  <Button */}
      {/*    onClick={onSearch} */}
      {/*    role='primary' */}
      {/*    title='Search' */}
      {/*  /> */}
      {/* </SearchWrapper> */}
      <StyledTable
        onSort={onSortChange}
        data={tradesWithTokens || []}
        columns={tradesColumns}
        loading={isFetching || isFetchingTokens}
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

// const SearchWrapper = styled.div`
//   display: flex;
//   margin-bottom: calc(var(--gap) * 2);
//   button {
//     margin-left: 8px;
//   }
//
//   @media (max-width: 768px) {
//     width: 100%;
//     .unique-input-text {
//       flex-grow: 1;
//     }
//   }
//
//   @media (max-width: 320px) {
//     .unique-button {
//       display: none;
//     }
//   }
// `;

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
