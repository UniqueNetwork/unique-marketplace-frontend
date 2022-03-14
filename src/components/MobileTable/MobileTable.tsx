import React, { FC } from 'react';
import { ColumnType, DefaultRecordType, GetRowKey } from 'rc-table/lib/interface';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import Loading from '../Loading';

interface MobileTableProps<RecordType = DefaultRecordType> {
  className?: string
  columns?: ColumnType<RecordType>[]
  data?: RecordType[]
  loading?: boolean
  rowKey?: string | GetRowKey<RecordType>
}

const MobileTable: FC<MobileTableProps> = ({
  columns,
  data,
  loading,
  rowKey
}) => {
  let children = <Loading />;

  if (!loading && data?.length === 0) children = <Text className={'text_grey'}>No data</Text>;
  else if (!loading) {
    children = <>{data?.map((item, index) => (
      <MobileTableRow
        key={typeof rowKey === 'function' ? rowKey(item, index) : item[rowKey as keyof DefaultRecordType]}
      >
        {columns?.map((column) => (
          <div key={`column-${column.key || ''}`}>
            {typeof column?.title === 'object' ? <>{column.title}</> : <Text color={'grey-500'}>{`${column?.title || ''}`}</Text>}
            {column.render && <>{column.render(item[column.dataIndex as keyof DefaultRecordType], item, index)}</>}
            {!column.render && <Text>{item[column.dataIndex as keyof DefaultRecordType]?.toString() || ''}</Text>}
          </div>
        ))}
      </MobileTableRow>
    ))}</>;
  }

  return (
    <MobileTableWrapper>{children}</MobileTableWrapper>
  );
};

const MobileTableWrapper = styled.div`
  margin: var(--gap) 0;
`;

const MobileTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px dashed var(--border-color);
  grid-row-gap: var(--gap);
  padding: var(--gap) 0;
  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  @media(max-width: 320px) {
    grid-template-columns: 1fr;
  }
`;

export default MobileTable;
