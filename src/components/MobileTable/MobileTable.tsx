import React, { FC } from 'react';
import { TableColumnProps, TableRowProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { MobileTableRow } from './MobileTableRow';
import MobileTableSkeleton from '../Skeleton/MobileTableSkeleton';

interface MobileTableProps {
  className?: string
  columns?: TableColumnProps[]
  data?: TableRowProps[]
  loading?: boolean
}

const MobileTable: FC<MobileTableProps> = ({
  columns,
  data,
  loading,
  className
}) => {
  let children = <MobileTableSkeleton columns={columns || []} />;

  if (!loading && data?.length === 0) children = <Text className={'text_grey'}>No data</Text>;
  else if (!loading) {
    children = <>{data?.map((item, index) => (
      <MobileTableRow
        key={index}
      >
        {columns?.map((column) => (
          <div key={`column-${column.field || ''}`}>
            {typeof column?.title === 'object' ? <>{column.title}</> : <Text color={'grey-500'}>{`${column?.title || ''}`}</Text>}
            {column.render && <>{column.render(item[column.field as keyof TableRowProps])}</>}
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
