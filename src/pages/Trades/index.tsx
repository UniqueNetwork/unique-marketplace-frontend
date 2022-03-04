import React, { FC, useCallback, useMemo, useState } from 'react';
import { Text, Pagination, Table } from '@unique-nft/ui-kit';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';

import { useTrades } from '../../api/restApi/trades/trades';
import { shortcutText } from '../../utils/textUtils';
import styled from 'styled-components';

const pageSize = 20;

const AddressComponent = ({ text }: { text: string }) => {
  const shortCut = useMemo(() => (shortcutText(text)), [text]);
  return <Text>{shortCut}</Text>;
};

const tradesColumns: TableColumnProps[] = [
  {
    title: 'Buyer',
    width: '30%',
    render: (data: string) => <AddressComponent text={data} />,
    field: 'buyer'
  },
  {
    title: 'Seller',
    width: '30%',
    render: (data: string) => <AddressComponent text={data} />,
    field: 'seller'
  },
  {
    title: 'Date',
    width: '10%',
    field: 'tradeDate'
  },
  {
    title: 'Collection',
    width: '10%',
    isSortable: true,
    field: 'collectionId'
  },
  {
    title: 'Token',
    width: '10%',
    isSortable: true,
    field: 'tokenId'
  },
  {
    title: 'Price',
    width: '10%',
    isSortable: true,
    field: 'price'
  }
];

export const TradesPage: FC = () => {
  const [page] = useState<number>(0);

  const { trades, tradesCount, fetchMore } = useTrades({ pageSize, page });

  const onPageChange = useCallback((newPage: number) => {
    console.log('new page', newPage);
    fetchMore({ page: newPage + 1, pageSize });
  }, [fetchMore]);

  return (
    <TradesPageWrapper>
      <Table
        onSort={console.log}
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
    </TradesPageWrapper>
  );
};

const TradesPageWrapper = styled.div`
  width: 100%
`;
