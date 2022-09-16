import React from 'react';
import { Text } from '@unique-nft/ui-kit';
import { formatKusamaBalance } from 'utils/textUtils';
import styled from 'styled-components';
import { AccountInfo } from './types';

interface IProps {
  isSmallDevice: boolean
  accountInfo: AccountInfo
  tokenSymbol: string
  testid?: string
}

function BalanceCell({ isSmallDevice, accountInfo, tokenSymbol, testid }: IProps) {
  const KSM = accountInfo.deposit || 0;
  const isDeposit = !!accountInfo.deposit;
  if (!isSmallDevice) {
    return (
      <BalancesWrapper>
        {!isDeposit && <Text testid={`${testid}-balance`}>{`${formatKusamaBalance(accountInfo.balance?.KSM?.toString() || 0)} ${tokenSymbol}`}</Text>}
        {isDeposit && (<>
          <Text color={'grey-500'} size={'s'} testid={`${testid}-deposit`}>{`${formatKusamaBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
          <Text color={'grey-500'} size={'s'}>market deposit</Text>
        </>)}
      </BalancesWrapper>
    );
  } else {
    return (
      <BalancesWrapper>
        <Text testid={`${testid}-balance`}>{`${formatKusamaBalance(accountInfo.balance?.KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
        {isDeposit && (<>
          <Text color={'grey-500'} size={'s'} testid={`${testid}-deposit`}>{`${formatKusamaBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
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
    gap: 4px;
  }
`;

export default BalanceCell;
