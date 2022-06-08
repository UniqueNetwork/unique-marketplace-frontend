import React, { FC } from 'react';
import styled from 'styled-components';
import { SortQuery, Table as UITable, TableColumnProps } from '@unique-nft/ui-kit';

import useDeviceSize, { DeviceSize } from '../hooks/useDeviceSize';
import MobileTable from './MobileTable/MobileTable';
import NoItems from './NoItems';
import Skeleton from './Skeleton/Skeleton';

interface TableProps {
  columns: TableColumnProps[]
  data?: any[]
  loading?: boolean
  onSort?(sorting: SortQuery): void
  className?: string
}

export const Table: FC<TableProps> = ({ columns, data, loading, onSort, className }) => {
  const deviceSize = useDeviceSize();

  const getSkeletonItem = () => ({});
  const getSkeletonRender = (column: TableColumnProps) => () => <Skeleton key={`skeleton-${column.field}`} height={24}/>;

  return (
    <TableWrapper>
      {deviceSize > DeviceSize.sm && (<>
        <UITable
          columns={loading
            ? columns.map((column) => ({ ...column, render: getSkeletonRender(column) }))
            : columns}
          data={loading ? Array.from({ length: 20 }).map(getSkeletonItem) : data || []}
          onSort={onSort}
        />
        {!loading && !data?.length && <NoItems />}
      </>)}
      {deviceSize <= DeviceSize.sm && (
        <MobileTable
          columns={columns}
          data={!loading ? data : []}
          loading={loading}
          className={className}
        />
      )}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  position: relative;
 .unique-table-data-row {
   height: unset;
   min-height: 40px;
   div {
     padding: 0;
   }
   & > div {
     padding: 0 var(--gap);
   } 
 }
`;
