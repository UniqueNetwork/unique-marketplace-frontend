import React, { useMemo } from 'react';
import { formatBalance } from 'utils/textUtils';
import styled from 'styled-components';
import { AccountInfo } from './types';
import { Text } from 'components/UI';

interface IProps {
  isSmallDevice: boolean
  accountInfo: AccountInfo
  tokenSymbol: string
  testid?: string
}

const fractionDigits = 4;

function BalanceCell({ isSmallDevice, accountInfo, tokenSymbol, testid }: IProps) {
  const KSM = accountInfo.deposit || 0;
  const isDeposit = !!accountInfo.deposit; // TODO: irrelevant

  const balance = useMemo(() => {
    return formatBalance(accountInfo.balances?.proper.parsed || '0', fractionDigits);
  }, [accountInfo.balances]);

  if (!isSmallDevice) {
    return (
      <BalancesWrapper>
        {!isDeposit && <Text testid={`${testid}-balance`}>{`${balance} ${tokenSymbol}`}</Text>}
        {isDeposit && (<>
          <Text color={'grey-500'} size={'s'} testid={`${testid}-deposit`}>{`${balance}}`}</Text>
          <Text color={'grey-500'} size={'s'}>market deposit</Text>
        </>)}
      </BalancesWrapper>
    );
  } else {
    return (
      <BalancesWrapper>
        <Text testid={`${testid}-balance`}>{`${balance} ${tokenSymbol}`}</Text>
        {isDeposit && (<>
          <Text color={'grey-500'} size={'s'} testid={`${testid}-deposit`}>{`${formatBalance(KSM?.toString() || 0)} ${tokenSymbol}`}</Text>
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
