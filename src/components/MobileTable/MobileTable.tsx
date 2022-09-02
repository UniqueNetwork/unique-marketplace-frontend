import React, { FC } from 'react';
import { IconProps, TableColumnProps, TableRowProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { MobileTableRow } from './MobileTableRow';
import MobileTableSkeleton from '../Skeleton/MobileTableSkeleton';
import EmptyTable from '../EmptyTable';

interface MobileTableProps {
  className?: string
  columns?: TableColumnProps[]
  data?: TableRowProps[]
  loading?: boolean
  emptyIconProps?: Omit<IconProps, 'size'>
  idColumnName: string
}

const MobileTable: FC<MobileTableProps> = ({
  columns,
  data,
  loading,
  className,
  emptyIconProps,
  idColumnName
}) => {
  let children = <MobileTableSkeleton columns={columns || []} />;

  if (!loading && data?.length === 0) children = <EmptyTable iconProps={emptyIconProps} />;
  else if (!loading) {
    children = <>{data?.map((item, rowIndex) => (
      <MobileTableRow
        key={item[idColumnName] as string}
      >
        {columns?.map((column, columnIndex) => (
          <div key={`column-${column.field || ''}`}>
            {typeof column?.title === 'object' ? <>{column.title}</> : <Text color={'grey-500'}>{`${column?.title || ''}`}</Text>}
            {column.render && <>{column.render(item[column.field as keyof TableRowProps], item, { rowIndex, columnIndex })}</>}
            {!column.render && <Text>{item[column.field as keyof TableRowProps]?.toString() || ''}</Text>}
          </div>
        ))}
      </MobileTableRow>
    ))}</>;
  }

  return (
    <div className={className}>{children}</div>
  );
};

export default MobileTable;
