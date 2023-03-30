import React, { FC } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import AccountLink from '../../../components/Account/AccountLink';
import { useAccounts } from '../../../hooks/useAccounts';
import { compareEncodedAddresses } from 'api/chainApi/utils/addressUtils';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { Avatar } from '../../../components/Avatar/Avatar';

interface BidderProps {
  accountAddress: string;
  testid?: string
}

const Bidder: FC<BidderProps> = ({ accountAddress, testid }) => {
  const { selectedAccount } = useAccounts();

  if (compareEncodedAddresses(accountAddress, selectedAccount?.getAddress() || '')) {
    return <Text size={'m'} color={'grey-600'} testid={`${testid}-you`}>You</Text>;
  }

  return (<BidderWrapper>
    <Avatar
      size={24}
      src={DefaultAvatar}
      address={accountAddress}
      testid={`${testid}-avatar`}
    />
    <AccountLink accountAddress={accountAddress} testid={`${testid}-address`}/>
  </BidderWrapper>

  );
};

const BidderWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  & > a {
    font-size: 16px;
  }
`;

export default Bidder;
