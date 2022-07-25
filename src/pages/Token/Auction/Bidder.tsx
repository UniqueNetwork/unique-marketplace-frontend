import React, { FC } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import AccountLink from '../../../components/Account/AccountLink';
import { useAccounts } from '../../../hooks/useAccounts';
import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { Avatar } from '../../../components/Avatar/Avatar';

interface BidderProps {
  accountAddress: string;
}

const Bidder: FC<BidderProps> = ({ accountAddress }) => {
  const { selectedAccount } = useAccounts();

  if (compareEncodedAddresses(accountAddress, selectedAccount?.address || '')) {
    return <Text size={'m'} color={'grey-600'}>You</Text>;
  }

  return (<BidderWrapper>
    <Avatar size={24} src={DefaultAvatar} address={accountAddress} />
    <AccountLink accountAddress={accountAddress} />
  </BidderWrapper>

  );
};

const BidderWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
`;

export default Bidder;
