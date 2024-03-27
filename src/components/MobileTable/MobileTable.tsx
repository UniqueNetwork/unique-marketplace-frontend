import React from 'react';

import { MobileTableRow } from './MobileTableRow';
import MobileTableSkeleton from '../Skeleton/MobileTableSkeleton';
import EmptyTable from '../EmptyTable';
import { getDeepValue } from 'utils/uiUtils';
import { TableColumnProps, TableRowProps } from 'components/UI/Table/Table';
import { IconProps } from 'components/UI/Icon/Icon';
import { Text } from 'components/UI';

interface MobileTableProps<T> {
  className?: string
  columns?: TableColumnProps[]
  data?: (TableRowProps & T)[]
  loading?: boolean
  emptyIconProps?: Omit<IconProps, 'size'>
}

function MobileTable<T>({
  columns,
  data,
  loading,
  className,
  emptyIconProps
}: MobileTableProps<T>) {
  let children = <MobileTableSkeleton columns={columns || []} />;

  if (!loading && data?.length === 0) children = <EmptyTable iconProps={emptyIconProps} />;
  else if (!loading) {
    children = <>{data?.map((item, rowIndex) => (
      <MobileTableRow
        key={item.key?.toString()}
      >
        {columns?.map((column, columnIndex) => (
          <div key={`column-${column.field || ''}`}>
            {typeof column?.title === 'object' ? <>{column.title}</> : <Text color={'grey-500'}>{`${column?.title || ''}`}</Text>}
            {column.render && <>{column.render(getDeepValue(item, column.field), item, { rowIndex, columnIndex })}</>}
            {!column.render && <Text>{getDeepValue(item, column.field)?.toString() || ''}</Text>}
          </div>
        ))}
      </MobileTableRow>
    ))}</>;
  }

  return (
    <div className={className}>{children}</div>
  );
}

export default MobileTable;
