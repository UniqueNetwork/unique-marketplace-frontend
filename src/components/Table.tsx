import React from 'react';
import styled from 'styled-components';
import { Table as UITable, Icon } from 'components/UI';

import useDeviceSize, { DeviceSize } from '../hooks/useDeviceSize';
import MobileTable from './MobileTable/MobileTable';
import Skeleton from './Skeleton/Skeleton';
import { SortQuery, TableColumnProps, TableRowProps } from './UI/Table/Table';
import { IconProps } from './UI/Icon/Icon';

interface TableProps<T> {
  columns: TableColumnProps[]
  data?: T[]
  loading?: boolean
  onSort?(sorting: SortQuery): void
  className?: string
  emptyIconProps?: Omit<IconProps, 'size'>
  idColumnName: string
}

export function Table<T extends TableRowProps = TableRowProps>({
  columns,
  data,
  loading,
  onSort,
  className,
  emptyIconProps
}: TableProps<T>) {
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
          data={loading ? Array.from({ length: 5 }).map(getSkeletonItem) : data || []}
          onSort={onSort}
          noDataIcon={<Icon {...emptyIconProps} size={80} />}
        />
      </>)}
      {deviceSize <= DeviceSize.sm && (
        <MobileTable<T>
          columns={columns}
          data={!loading ? data || [] : []}
          loading={loading}
          className={className}
          emptyIconProps={emptyIconProps}
        />
      )}
    </TableWrapper>
  );
}

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
