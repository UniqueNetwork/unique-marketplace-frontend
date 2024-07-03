import { useState } from 'react';
import styled from 'styled-components';
import { BalanceResponse } from '@unique-nft/sdk';
import { getDeepValue, sortData } from 'utils/uiUtils';
import { TableColumnProps, TableRowProps } from './Table';
import BalanceDisplay from './BalanceDisplay';

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
      {row['fungibleBalances'] && row['fungibleBalances'].size > 0 && (
        <BalanceDisplay balances={row['fungibleBalances']} />
      )}
    </TableRowWrapper>
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
`;
