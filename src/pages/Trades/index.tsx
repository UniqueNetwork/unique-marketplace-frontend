import React, { FC, useState } from 'react';
import { Pagination, Table } from '@unique-nft/ui-kit';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';

import { useFetchEntities } from '../../hooks/useFetchEntities';
import { GetTradesRequestPayload, Trade } from '../../api/restApi/trades/types';
import * as api from '../../api/restApi';

const pageSize = 20;

const tradesColumns: TableColumnProps[] = [
  {
    title: 'Buyer',
    width: '100%',
    field: 'buyer'
  },
  {
    title: 'Seller',
    width: '100%',
    field: 'suyer'
  },
  {
    title: 'Date',
    width: '100%',
    field: 'tradeDate'
  },
  {
    title: 'Collection',
    width: '100%',
    field: 'collectionId'
  },
  {
    title: 'Token',
    width: '100%',
    field: 'tokenId'
  },
  {
    title: 'Price',
    width: '100%',
    field: 'price'
  }
];

export const TradesPage: FC = () => {
  const [page, setPage] = useState<number>(1);

  const { items, count } = useFetchEntities<GetTradesRequestPayload, Trade>({ page: 0, pageSize }, api.trades.getTrades);

  return (
    <div>
      <Table
        data={items || []}
        columns={tradesColumns}
      />
      <Pagination size={count} current={page} perPage={pageSize} />
    </div>
  );
};
