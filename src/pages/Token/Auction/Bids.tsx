import React, { FC } from 'react';
import { Text, Table, Link } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Offer } from '../../../api/restApi/offers/types';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { timestampTableFormat } from '../../../utils/timestampUtils';
import { formatKusamaBalance, shortcutText } from '../../../utils/textUtils';
import config from '../../../config';

interface BidsProps {
  offer: Offer
}

const getColumns = (tokenSymbol: string): TableColumnProps[] => ([
  {
    title: 'Bid',
    field: 'amount',
    width: '100%',
    render: (bid: string) => <Text color={'dark'}>{`${formatKusamaBalance(bid)} ${tokenSymbol}`}</Text>
  },
  {
    title: 'Time',
    field: 'createdAt',
    width: '100%',
    render: (createdAt: string) => timestampTableFormat(new Date(createdAt).valueOf())
  },
  {
    title: 'Bidder',
    field: 'bidderAddress',
    width: '100%',
    render: (account: string) => <Link href={`${config.scanUrl}account/${account}`} title={shortcutText(account)} />
  }
]);

const tokenSymbol = 'KSM';

const Bids: FC<BidsProps> = ({ offer }) => {
  if (!offer) return null;

  const isBids = Number(offer?.auction?.bids?.length) > 0;

  return (
    <BidsWrapper>
      {!isBids && <Text >There is no bids</Text>}
      {isBids && <Table
        data={offer.auction!.bids}
        columns={getColumns(tokenSymbol)}
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
`;
