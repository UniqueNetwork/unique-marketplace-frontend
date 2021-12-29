import { useQuery } from '@apollo/client';
import Table from 'rc-table';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import LoadingComponent from '../../../components/LoadingComponent';
import { Data as ExtrinsicsData, Variables as ExtrinsicsVariables, getExtrinsicsQuery } from '../../../api/graphQL/extrinsicsForBlock';
import { timeDifference } from '../../../utils/timestampUtils';
import PaginationComponent from '../../../components/Pagination';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';

const blockColumns = [
  {
    title: 'Action',
    dataIndex: 'method',
    key: 'method',
    width: 100,
  },
  {
    title: 'ID', dataIndex: 'block_index', key: 'block_index', width: 100,
    render: (value: string) => <Link to={`/extrinsic/${value}`}>{value}</Link>,
  },
  {
    title: 'Age', dataIndex: 'timestamp', key: 'timestamp', width: 100,
    render: (value: number) => <div>{timeDifference(value)}</div>,
  },

  { title: 'Hash', dataIndex: 'hash', key: 'hash', width: 100 },
];


const ExtrinsicsListComponent = (props: any) => {
  const deviceSize = useDeviceSize();
  const { blockNumber } = props;
  const pageSize = 10;


  const {
    loading,
    error,
    fetchMore: fetchMoreExtrinsics,
    data: eventsList,
  } = useQuery<ExtrinsicsData, ExtrinsicsVariables>(getExtrinsicsQuery, {
    variables: {
      limit: pageSize,
      offset: 0,
      order_by: { block_number: 'desc' },
      where: { block_number: { _eq: blockNumber } }
    },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const onPageChange = useCallback(
    (limit: number, offset: number) =>
      fetchMoreExtrinsics({
        variables: {
          limit,
          offset,
        },
      }),
    [fetchMoreExtrinsics],
  );

  return (
    <>
      <Table
        columns={blockColumns}
        data={eventsList?.view_extrinsic}
        emptyText={() => !loading ? 'No data' : <LoadingComponent/>}
        rowKey={'block_index'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={eventsList?.view_extrinsic_aggregate?.aggregate?.count || 0}
        onPageChange={onPageChange}
        siblingCount={deviceSize === DeviceSize.sm ? 1 : 2}
      />
    </>
  );
};

export default ExtrinsicsListComponent;
