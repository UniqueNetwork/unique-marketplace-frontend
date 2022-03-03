import React, { FC, useCallback, useState } from 'react';
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

  const { trades, tradesCount, fetchMore } = useTrades({ pageSize, page });

  const onPageChange = useCallback((newPage: number) => {
    console.log('ON PAGE CHANGE, NEW PAGE', newPage);
    fetchMore({ page: newPage + 1, pageSize });
  }, [fetchMore]);

  return (
    <div>
      <Table
        data={trades || []}
        columns={tradesColumns}
      />
      {/* TODO: 100 + here to avoid disappear of pagination */}
      <Pagination size={100 + tradesCount}
        current={page}
        perPage={pageSize}
        onPageChange={onPageChange}
        withIcons
      />
    </div>
  );
};
