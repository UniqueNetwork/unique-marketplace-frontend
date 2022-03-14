import React, { FC } from 'react';
import { ColumnType, DefaultRecordType, GetRowKey } from 'rc-table/lib/interface';
import styled from 'styled-components';

import useDeviceSize, { DeviceSize } from '../hooks/useDeviceSize';
import MobileTable from './MobileTable/MobileTable';
import Loading from './Loading';

interface TableProps<RecordType = DefaultRecordType> {
  columns?: ColumnType<RecordType>[]
  data?: RecordType[]
  loading?: boolean
  rowKey?: string | GetRowKey<RecordType>
}

const Table: FC<TableProps> = ({ columns, data, loading, rowKey }) => {
  const deviceSize = useDeviceSize();

  return (
    <TableWrapper>
      {deviceSize > DeviceSize.sm && (<>
        <Table
          columns={columns}
          data={data || []}
          rowKey={rowKey}
        />
        {loading && <TableLoading />}
      </>)}
      {deviceSize <= DeviceSize.sm && (
        <MobileTable
          columns={columns}
          data={!loading ? data : []}
          loading={loading}
          rowKey={rowKey}
        />
      )}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  position: relative;
  .rc-table {
    margin-bottom: calc(var(--gap) * 1.5);
    table {
      width: 100%;
      border-spacing: 0px;
      table-layout: fixed !important;
    }
    &-thead {
      tr {
        background-color: var(--blue-gray);

      }
      th {
        padding: calc(var(--gap) / 2) var(--gap);
        text-align: left;
        color: var(--grey);
        font-size: 16px;
        font-weight: 500;

      }
    }
    &-tbody {
      td {
        padding: calc(var(--gap) / 2) var(--gap);
        text-align: left;
        font-size: 16px;
        border-bottom: 1px dashed #D2D3D6;
        color: var(--grey-600);
      }
    }
    &-placeholder {
      td {
        text-align: center;
        color: var(--grey);
        padding: var(--gap) 0 !important;
      }
    }
  }

  @media (max-width: 767px) {
    .rc-table {
      display: none;
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

export default Table;
