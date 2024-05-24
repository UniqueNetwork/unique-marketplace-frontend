import { useState } from 'react';
import styled from 'styled-components';
import { BalanceResponse } from '@unique-nft/sdk';
import { getDeepValue, sortData } from 'utils/uiUtils';
import { TableColumnProps, TableRowProps } from './Table';

interface TableRowItem {
  row: TableRowProps;
  rowIndex: number;
  columns: TableColumnProps[];
  columnPadding: number;
}

export const TableRow: React.FC<TableRowItem> = ({
  row,
  rowIndex,
  columns,
  columnPadding
}) => {
  const [showBalance, setShowBalance] = useState(false);
  const toggleShowBalance = () => {
    setShowBalance((prevState) => !prevState);
  };

  return (
    <TableRowWrapper>
      <div className='unique-table-data-row'>
        {columns.map((column, columnIndex) => (
          <div
            key={`${column.field}-${columnIndex}`}
            style={{
              width: `calc(${column.width} - ${columnPadding}px)`,
              paddingLeft: `${columnPadding / 2}px`,
              paddingRight: `${columnPadding / 2}px`
            }}
          >
            {column.render?.(getDeepValue(row, column.field), row, {
              rowIndex,
              columnIndex
            }) || getDeepValue(row, column.field)}
          </div>
        ))}
      </div>
      {row['fungibleBalances']?.keys() && (
        <ShowMoreButton onClick={toggleShowBalance}>
          {showBalance ? 'hide' : 'show other balances'}
        </ShowMoreButton>
      )}
      {showBalance && (
        <>
          {row['fungibleBalances'] &&
            Array.from(row['fungibleBalances'].entries()).map(
              ([token, balance]: [string, BalanceResponse]) => (
                <BalanceLine
                  token={token}
                  amount={balance.formatted}
                  unit={balance.unit}
                  key={`balance_line_${token}`}
                />
              )
            )}
        </>
      )}
    </TableRowWrapper>
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


const TableRowWrapper = styled.div`
  background-image: linear-gradient(
    to right,
    var(--color-grey-300) 50%,
    rgba(255, 255, 255, 0) 0%
  );

  background-size: 4px 1px;
  background-repeat: repeat-x;
  color: var(--color-blue-grey-600);
`;

const BalanceItem = styled.div`
  margin-bottom: 5px;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;

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
