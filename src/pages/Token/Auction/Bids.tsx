import React, { FC, useCallback, useMemo, useState } from 'react';
import { Heading, Text, Table, Link } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Bid, Offer } from '../../../api/restApi/offers/types';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { timestampTableFormat } from '../../../utils/timestampUtils';
import { shortcutText } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';
import { useBidsSubscription } from '../../../hooks/useBidsSubscription';

interface BidsProps {
  offer: Offer
}

const getColumns = (tokenSymbol: string): TableColumnProps[] => ([
  {
    title: 'Bid',
    field: 'amount',
    width: '100%',
    render: (bid: string) => <Text color={'dark'}>{`${bid} ${tokenSymbol}`}</Text>
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
    render: (account: string) => <Link href={`/account/${account}`} title={shortcutText(account)} />
  }
]);

const Bids: FC<BidsProps> = ({ offer }) => {
  const [bids, setBids] = useState<Bid[]>(offer.auction?.bids || []);
  const { chainData } = useApi();
  const tokenSymbol = useMemo(() => chainData?.properties.tokenSymbol || 'unavailable', [chainData]);

  const onPlaceBid = useCallback((bid: Bid) => {
    setBids([bid, ...bids]);
  }, [bids]);

  useBidsSubscription({ offer, onPlaceBid });

  if (!offer) return null;

  return (
    <BidsWrapper>
      <Heading size={'4'}>Offers</Heading>
      {!offer.auction?.bids?.length && <Text >There is no bids</Text>}
      {offer.auction?.bids?.length && <Table
        data={offer.auction?.bids}
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
