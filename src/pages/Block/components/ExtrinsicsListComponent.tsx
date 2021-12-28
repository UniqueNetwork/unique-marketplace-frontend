import { useQuery } from '@apollo/client';
import Table from 'rc-table';
import React  from 'react'
import { Link } from 'react-router-dom';
import LoadingComponent from '../../../components/LoadingComponent';

import { Data as ExtrinsicsData, Variables as ExtrinsicsVariables, getExtrinsicsQuery } from '../../../api/graphQL/extrinsicsForBlock';
import { timeDifference } from '../../../utils/timestampUtils';

const blockColumns = [
  {
    title: 'Action',
    dataIndex: 'method',
    key: 'method',
    width: 100,
  },
  { title: 'ID', dataIndex: 'block_index', key: 'block_index', width: 100,
    render: (value: string) => <Link to={`/extrinsic/${value}`}>{value}</Link>,
  },
  { title: 'Age', dataIndex: 'timestamp', key: 'timestamp', width: 100,
    render: (value: number) => <div>{timeDifference(value)}</div>,
  },

  { title: 'Hash', dataIndex: 'hash', key: 'hash', width: 100 },
]




const ExtrinsicsListComponent = (props: any) => {
  const { blockNumber } = props;

  const {
    loading,
    error,
    data: eventsList,
  } = useQuery<ExtrinsicsData, ExtrinsicsVariables>(getExtrinsicsQuery, {
    variables: {
      limit: 10,
      offset: 0,
      // where: {block_number: {_eq: blockNumber}}
    },
    notifyOnNetworkStatusChange: true,
  });

  console.log(eventsList);

  return (
    <Table
      columns={blockColumns}
      data={eventsList?.view_extrinsic}
      emptyText={() => !loading ? 'No data' : <LoadingComponent />}
      rowKey={'block_index'}
    />
  )
}

export default ExtrinsicsListComponent
