import React, { FC, useMemo } from 'react';
import { Text, Button } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Offer } from '../../../api/restApi/offers/types';
import { NFTToken } from '../../../api/chainApi/unique/types';
import Bids from './Bids';
import { Icon } from '../../../components/Icon/Icon';
import clock from '../../../static/icons/clock.svg';
import { timeDifference } from '../../../utils/timestampUtils';
import { Grey300 } from '../../../styles/colors';
import { isTokenOwner } from '../../../api/chainApi/utils/isTokenOwner';
import { useAccounts } from '../../../hooks/useAccounts';

interface AuctionProps {
  offer: Offer
  token: NFTToken
  onPlaceABidClick(): void
  onDelistClick(): void
  onWithdrawClick(): void
}

const Auction: FC<AuctionProps> = ({ offer, token, onPlaceABidClick, onDelistClick, onWithdrawClick }) => {
  const { selectedAccount } = useAccounts();

  const canPlaceABid = useMemo(() => {
    return true; // TODO: get a balance of selected account
  }, []);

  const canDelist = useMemo(() => {
    if (!selectedAccount) return false;
    return isTokenOwner(selectedAccount.address, token.owner || {}) && !offer.auction?.bids.length;
  }, []);

  const canWithdraw = useMemo(() => {
    return false; // TODO: check it
  }, []);

  if (!offer) return null;

  return (
    <AuctionWrapper>
      <Row>
        {canDelist && <Button title={'Delist'}
          role={'danger'}
          onClick={onDelistClick}
          disabled={!canPlaceABid}
        />}
        {!canDelist && <Button title={'Place a bid'}
          role={'primary'}
          onClick={onPlaceABidClick}
          disabled={!canPlaceABid}
        />}
        {canWithdraw && <Button title={'Withdraw'} onClick={onWithdrawClick} />}

        <TimeLimitWrapper>
          <Icon path={clock} />
          <Text color={'dark'}>{`${timeDifference(new Date(offer.auction?.stopAt || '').getTime() / 1000)} left`}</Text>
        </TimeLimitWrapper>

      </Row>
      <Divider />
      <Bids offer={offer} />
    </AuctionWrapper>
  );
};

export default Auction;

const AuctionWrapper = styled.div`
  margin-top: 24px;
`;

const TimeLimitWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: var(--gap)

`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
