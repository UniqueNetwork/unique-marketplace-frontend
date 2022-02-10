import React, { FC, useState } from 'react';
import { Pagination, Table } from '@unique-nft/ui-kit';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';

import { useTrades } from '../../api/restApi/trades/trades';

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
  const [page] = useState<number>(0);

  const { trades, tradesCount } = useTrades({ pageSize, collectionId: [1, 2, 3] });

  return (
    <div>
      <Table
        data={trades || []}
        columns={tradesColumns}
      />
      <Pagination size={tradesCount} current={page} perPage={pageSize} />
    </div>
  );
};
