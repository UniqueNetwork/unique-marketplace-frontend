import React, { FC, useEffect, useState } from 'react';
import { Heading, Icon, Modal, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { TokenComponent } from './TokenComponent/TokenComponent';
import { AdditionalDark, BlueGrey600 } from 'styles/colors';
import { timestampTableFormat } from 'utils/timestampUtils';
import { AddressComponent } from './AddressComponent/AddressComponent';
import Winner from 'static/icons/winner.svg';
import { Table } from 'components/Table';
import { useTradeDetails } from 'api/restApi/trades/tradeDetails';
import { Bid, Trade } from 'api/restApi/trades/types';
import { formatKusamaBalance } from 'utils/textUtils';

export interface IConfirmModalProps {
  trade: Trade | null
  onCancel: () => void
}
const tokenSymbol = 'KSM';

const columns = [
  {
    title: 'Bid',
    width: '32%',
    render: (value: string) => <Text color={AdditionalDark}>{`${formatKusamaBalance(value)} ${tokenSymbol}`}</Text>,
    field: 'balance'
  },
  {
    title: 'Time',
    width: '32%',
    isSortable: true,
    render: (time: number) => <TimeCell><Text color={BlueGrey600}>{timestampTableFormat(new Date(time).valueOf())}</Text></TimeCell>,
    field: 'updatedAt'
  },
  {
    title: 'Bidder',
    width: '36%',
    render: (data: string, row: Bid) => <BidderCell><AddressComponent text={data} />{row.isWinner && <Icon size={32} file={Winner}/>}</BidderCell>,
    field: 'bidderAddress'
  }
];

const TokenTradesDetailsModal: FC<IConfirmModalProps> = ({ trade, onCancel }) => {
  const [filteredBids, setFilteredBids] = useState<Bid[]>();
  const { tradeDetails, fetch, isFetching } = useTradeDetails();
  useEffect(() => {
    if (trade) {
      fetch(trade.offerId);
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
      <Heading size='2'>Auction details</Heading>
      <Content>
        <TokenComponentWrapper>
          {trade && <TokenComponent {...trade} />}
        </TokenComponentWrapper>
        <TableStyled
          columns={columns}
          data={filteredBids}
          loading={isFetching}
        />
      </Content>
    </Modal>
  );
};

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
