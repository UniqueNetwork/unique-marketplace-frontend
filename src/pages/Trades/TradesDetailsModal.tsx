import React, { FC, useEffect, useState } from 'react';
import { Heading, TableRowProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Icon } from 'components/UI/Icon/Icon';
import { TokenComponent } from './TokenComponent/TokenComponent';
import { AdditionalDark, BlueGrey600, Grey500 } from 'styles/colors';
import { timestampTableFormat } from 'utils/timestampUtils';
import { AddressComponent } from './AddressComponent/AddressComponent';
import { Table } from 'components/Table';
import { useTradeDetails } from 'api/restApi/trades/tradeDetails';
import { Bid, Trade } from 'api/restApi/trades/types';
import { formatKusamaBalance } from 'utils/textUtils';
import Winner from 'static/icons/winner.svg';
import { Modal } from 'components/UI';

export interface IConfirmModalProps {
  trade: Trade | null
  onCancel: () => void
  testid: string
}

const tokenSymbol = 'KSM';

const getColumns = (testid: string) => [
  {
    title: (<Header data-testid={`${testid}-header-bid`}>Bid</Header>),
    width: '32%',
    render: (value: string, bid: Bid) => <Text testid={`${testid}-bid-${bid.id}`} color={AdditionalDark}>{`${formatKusamaBalance(value)} ${tokenSymbol}`}</Text>,
    field: 'balance'
  },
  {
    title: (<Header data-testid={`${testid}-header-time`}>Time</Header>),
    width: '32%',
    isSortable: true,
    render: (time: number, bid: Bid) => <TimeCell><Text testid={`${testid}-time-${bid.id}`} color={BlueGrey600}>{timestampTableFormat(new Date(time).valueOf())}</Text></TimeCell>,
    field: 'updatedAt'
  },
  {
    title: (<Header data-testid={`${testid}-header-bidder`}>Bidder</Header>),
    width: '36%',
    render: (data: string, bid: Bid) => <BidderCell><AddressComponent text={data} testid={`${testid}-bidder-${bid.id}`} />{bid.isWinner && <Icon size={32} file={Winner}/>}</BidderCell>,
    field: 'bidderAddress'
  }
];

const TokenTradesDetailsModal: FC<IConfirmModalProps> = ({ trade, onCancel, testid }) => {
  const [filteredBids, setFilteredBids] = useState<(Bid & TableRowProps)[]>();
  const { tradeDetails, fetch, isFetching } = useTradeDetails();
  useEffect(() => {
    if (trade) {
      void fetch(trade.offerId);
    }
  }, [fetch, trade]);

  useEffect(() => {
    if (tradeDetails?.bids) {
      const bids = tradeDetails.bids
      .filter((bid) => {
        return (!bid.amount.startsWith('-') && bid.status === 'finished');
      })
      .sort((a, b) => {
        return a.updatedAt < b.updatedAt ? 1 : -1;
      });
      bids[0] = { ...bids[0], isWinner: true };
      setFilteredBids(bids);
    }
  }, [tradeDetails]);

  return (
    <Modal isVisible={!!trade?.offerId} onClose={onCancel} isClosable>
      <Heading size='2' testid={`${testid}-header`}>Auction details</Heading>
      <Content>
        <TokenComponentWrapper>
          {trade && <TokenComponent testid={testid} {...trade} />}
        </TokenComponentWrapper>
        <TableStyled
          columns={getColumns(`${testid}-table`)}
          data={filteredBids}
          loading={isFetching}
          idColumnName={'id'}
        />
      </Content>
    </Modal>
  );
};

const Header = styled.span`
  color: ${Grey500};
`;

const Content = styled.div`
  .unique-table-data {
    max-height: 400px;
    overflow: auto;
    @media (max-width: 640px) {
      max-height: unset;
    }
  }
`;

const TableStyled = styled(Table)`
  @media (max-width: 768px) {
    max-height: 400px;
    overflow: auto;
  }
  @media (max-width: 640px) {
    & > div {
      grid-template-columns: 1fr !important;
    }
  }
`;

const TokenComponentWrapper = styled.div`
  display: inline-block;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    margin-bottom: 0;
  }
`;

const TimeCell = styled.div`
  padding: 9px 0 !important;
`;

const BidderCell = styled.div`
  display: flex;
  img {
    margin-left: var(--gap);
  }
`;

export default TokenTradesDetailsModal;
