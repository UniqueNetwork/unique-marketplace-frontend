import React from 'react';
import { Text } from '@unique-nft/ui-kit';
import { formatKusamaBalance } from 'utils/textUtils';
import styled from 'styled-components';
import { AccountInfo } from './types';

interface IProps {
  isSmallDevice: boolean
  accountInfo: AccountInfo
  tokenSymbol: string
}

function BalanceCell({ isSmallDevice, accountInfo, tokenSymbol }: IProps) {
  const KSM = accountInfo.deposit || 0;
  const isDeposit = !!accountInfo.deposit;
  if (!isSmallDevice) {
    return (
      <BalancesWrapper>
        {!isDeposit && <Text>{`${formatKusamaBalance(accountInfo.balance?.KSM?.toString() || 0)} ${tokenSymbol}`}</Text>}
        {isDeposit && (<>
          <Text color={'grey-500'} size={'s'}>{`${formatKusamaBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
          <Text color={'grey-500'} size={'s'}>market deposit</Text>
        </>)}
      </BalancesWrapper>
    );
  } else {
    return (
      <BalancesWrapper>
        <Text>{`${formatKusamaBalance(accountInfo.balance?.KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
        {isDeposit && (<>
          <Text color={'grey-500'} size={'s'}>{`${formatKusamaBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
          <Text color={'grey-500'} size={'s'}>market deposit</Text>
        </>)}
      </BalancesWrapper>
    );
  }
}

const BalancesWrapper = styled.div`
  && {
    display: flex;
    flex-direction: column;
    padding: 20px 0 !important;
  }
`;

export default BalanceCell;
