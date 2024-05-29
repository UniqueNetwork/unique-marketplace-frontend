import { useState } from 'react';
import styled from 'styled-components';
import { BalanceResponse } from '@unique-nft/sdk';

interface BalanceDisplayProps {
  balances: Map<string, BalanceResponse>;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balances }) => {
  const [showBalance, setShowBalance] = useState(false);
  const toggleShowBalance = () => {
    setShowBalance((prevState) => !prevState);
  };

  return (
    <div>
      <ShowMoreButton onClick={toggleShowBalance}>
        {showBalance ? 'hide' : 'show other balances'}
      </ShowMoreButton>
      {showBalance && (
        <>
          {Array.from(balances.entries()).map(
            ([token, balance]: [string, BalanceResponse]) => (
              <BalanceLine
                token={balance.unit}
                amount={balance?.amount}
                unit={balance?.unit}
                key={`balance_line_${token}`}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

export const BalanceLine = ({
  token,
  amount,
  unit
}: {
  token: string;
  amount: number | string;
  unit: string;
}) => {
  return (
    <BalanceItem>
      <TokenName>{token}:</TokenName>
      <span>
        {amount} {unit}
      </span>
    </BalanceItem>
  );
};

const BalanceItem = styled.div`
  margin-bottom: 5px;
  padding: 5px 0;
  display: flex;
  justify-content: space-between;
	color: var(--color-grey-500);
	border-bottom: 1px dotted var(--color-grey-300);

  &:last-child {
    border-bottom: none;
  }
`;

const TokenName = styled.span`
  font-weight: bold;
`;

const ShowMoreButton = styled.div`
  margin-bottom: 4px;
  color: var(--color-grey-500);
  text-decoration: underline;
  cursor: pointer;

  :hover {
    color: var(--color-grey-700);
  }
`;

export default BalanceDisplay;
