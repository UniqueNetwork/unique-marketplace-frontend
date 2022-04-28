import React, { FC } from 'react';
import styled from 'styled-components';
import { Table as UITable } from '@unique-nft/ui-kit';
import { SortQuery, TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';

import useDeviceSize, { DeviceSize } from '../hooks/useDeviceSize';
import MobileTable from './MobileTable/MobileTable';
import Loading from './Loading';
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

const TableLoading = styled(Loading)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  background-color: rgba(255, 255, 255, 0.7);
`;
