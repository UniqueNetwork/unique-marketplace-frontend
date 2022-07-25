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
}

const MobileTable: FC<MobileTableProps> = ({
  columns,
  data,
  loading,
  className,
  emptyIconProps
}) => {
  let children = <MobileTableSkeleton columns={columns || []} />;

  if (!loading && data?.length === 0) children = <EmptyTable iconProps={emptyIconProps} />;
  else if (!loading) {
    children = <>{data?.map((item, index) => (
      <MobileTableRow
        key={index}
      >
        {columns?.map((column) => (
          <div key={`column-${column.field || ''}`}>
            {typeof column?.title === 'object' ? <>{column.title}</> : <Text color={'grey-500'}>{`${column?.title || ''}`}</Text>}
            {column.render && <>{column.render(item[column.field as keyof TableRowProps], item)}</>}
            {!column.render && <Text>{item[column.field as keyof TableRowProps]?.toString() || ''}</Text>}
          </div>
        ))}
      </MobileTableRow>
    ))}</>;
  }

  return (
    <MobileTableWrapper className={className}>{children}</MobileTableWrapper>
  );
};

const MobileTableWrapper = styled.div`
  && {
    margin: var(--gap) 0;  
  }
`;

export default MobileTable;
