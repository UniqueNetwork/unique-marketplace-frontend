import React, { FC, useCallback, useMemo, useState } from 'react';
import { TableColumnProps, TableRowProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import Calendar from '../../../static/icons/calendar.svg';
import { Icon } from 'components/UI/Icon/Icon';
import { Offer } from '../../../api/restApi/offers/types';
import { timeDifference, timestampTableFormat } from '../../../utils/timestampUtils';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { Table } from '../../../components/Table';
import Bidder from './Bidder';

interface BidsProps {
  offer: Offer
  testid?: string
}

const getColumns = (tokenSymbol: string, timeRender: 'Age' | 'Time', onTimeRenderChange: () => void, testid?: string): TableColumnProps[] => ([
  {
    title: 'Bid',
    field: 'bidValue',
    width: '33%',
    render: (bid: string) => <Text color={'additional-dark'} testid={`${testid}-bid-amount`}>{`${formatKusamaBalance(bid)} ${tokenSymbol}`}</Text>
  },
  {
    title: <TimeSwitch onClick={onTimeRenderChange} data-testid={`${testid}-create-at-column`}>{timeRender}<Icon {...(timeRender === 'Age' ? { name: 'clock', size: 18 } : { file: Calendar, size: 24 })}/></TimeSwitch>,
    field: 'createdAt',
    width: '33%',
    render: (createdAt: string) => <Text color={'blue-grey-600'} testid={`${testid}-create-at`}>{timeRender === 'Time' ? timestampTableFormat(new Date(createdAt).valueOf()) : `${timeDifference(new Date(createdAt).valueOf() / 1000)} ago`}</Text>
  },
  {
    title: 'Bidder',
    field: 'bidderAddress',
    width: '33%',
    render: (account: string) => <Bidder accountAddress={account} testid={`${testid}-bidder`}/>
  }
]);

const tokenSymbol = '!!!OLD_KSM!!!';

interface IBid extends TableRowProps {
  bidValue: string,
  amount: string,
  balance: string,
  bidderAddress: string,
  createdAt: string,
  pendingAmount: string,
  updatedAt: string
}

const Bids: FC<BidsProps> = ({ offer, testid }) => {
  const [timeRender, setTimeRender] = useState<'Time' | 'Age'>('Time');

  const onTimeRenderChange = useCallback(() => {
    setTimeRender((value) => value === 'Time' ? 'Age' : 'Time');
  }, [setTimeRender]);

  const bids: IBid[] = useMemo(() => {
    return offer?.auction?.bids?.map((item) => ({
      ...item,
      bidValue: item.balance !== '0' ? item.balance : item.amount
    })) || [];
  }, [offer?.auction?.bids]);

  if (!offer) return null;

  return (
    <BidsWrapper>
      {!offer.auction?.bids?.length && <Text color={'grey-500'} testid={`${testid}-no-bids`}>There are no bids</Text>}
      {!!offer.auction?.bids?.length && <Table
        data={bids}
        columns={getColumns(tokenSymbol, timeRender, onTimeRenderChange, testid)}
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
