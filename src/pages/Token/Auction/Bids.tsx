import React, { FC, useCallback, useMemo, useState } from 'react';
import { Icon, TableColumnProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import Calendar from '../../../static/icons/calendar.svg';

import { Offer } from '../../../api/restApi/offers/types';
import { timeDifference, timestampTableFormat } from '../../../utils/timestampUtils';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { Table } from '../../../components/Table';
import Bidder from './Bidder';

interface BidsProps {
  offer: Offer
}

const getColumns = (tokenSymbol: string, timeRender: 'Age' | 'Time', onTimeRenderChange: () => void): TableColumnProps[] => ([
  {
    title: 'Bid',
    field: 'bidValue',
    width: '33%',
    render: (bid: string) => <Text color={'additional-dark'}>{`${formatKusamaBalance(bid)} ${tokenSymbol}`}</Text>
  },
  {
    title: <TimeSwitch onClick={onTimeRenderChange}>{timeRender}<Icon {...(timeRender === 'Age' ? { name: 'clock', size: 18 } : { file: Calendar, size: 24 })}/></TimeSwitch>,
    field: 'createdAt',
    width: '33%',
    render: (createdAt: string) => <Text color={'blue-grey-600'}>{timeRender === 'Time' ? timestampTableFormat(new Date(createdAt).valueOf()) : `${timeDifference(new Date(createdAt).valueOf() / 1000)} ago`}</Text>
  },
  {
    title: 'Bidder',
    field: 'bidderAddress',
    width: '33%',
    render: (account: string) => <Bidder accountAddress={account} />
  }
]);

const tokenSymbol = 'KSM';

const Bids: FC<BidsProps> = ({ offer }) => {
  const [timeRender, setTimeRender] = useState<'Time' | 'Age'>('Time');

  const onTimeRenderChange = useCallback(() => {
    setTimeRender((value) => value === 'Time' ? 'Age' : 'Time');
  }, [setTimeRender]);

  const bids = useMemo(() => {
    return offer?.auction?.bids?.map((item) => ({
      ...item,
      bidValue: item.balance !== '0' ? item.balance : item.amount
    })) || [];
  }, [offer?.auction?.bids]);

  if (!offer) return null;

  return (
    <BidsWrapper>
      {!offer.auction?.bids?.length && <Text color={'grey-500'}>There are no bids</Text>}
      {!!offer.auction?.bids?.length && <Table
        data={bids}
        columns={getColumns(tokenSymbol, timeRender, onTimeRenderChange)}
        idColumnName={'bidValue'}
      />}
    </BidsWrapper>
  );
};

export default Bids;

const BidsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) * 1.5);
  .table-header-cell {
    font-size: 16px;
  }
  .unique-table-data-row > div {
    font-size: 16px;
    
  }
`;

const TimeSwitch = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  column-gap: calc(var(--gap) / 4);
  color: var(--color-primary-500);
  user-select: none;
  font-size: 16px;
  height: 24px;
`;
