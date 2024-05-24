import { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { BalanceResponse } from '@unique-nft/sdk';
import { sortData } from 'utils/uiUtils';
import { Icon, Text } from '..';
import styled from 'styled-components';
import { IconProps } from '../Icon/Icon';
import { TableRow } from './TebleRow';

const SORT_MODES = ['initial', 'desc', 'asc'];

export interface SortQuery {
  field: string;
  mode: number;
}

type ColumnPadding = 8 | 16 | 32;

export interface TableColumnProps {
  title: ReactNode;
  width: string;
  /*
   * Key in object up to required value.
   * Can be compound (key.subkey.value).
   */
  field: string;
  iconLeft?: IconProps;
  iconRight?: IconProps;
  isSortable?: boolean;
  render?(
    data: any,
    row: any,
    index: { rowIndex: number; columnIndex: number }
  ): ReactNode;
  compareFunc?: (a: any, b: any) => number;
}

export interface TableProps {
  columns: TableColumnProps[];
  columnPadding?: ColumnPadding;
  data: TableRowProps[];
  noDataMessage?: string | null;
  noDataIcon?: ReactNode | null;
  onSort?(sorting: SortQuery): void;
}

export interface TableRowProps {
  key?: React.Key;
  fungibleBalances?: Map<string, BalanceResponse>;
}

export const Table = ({
  columns,
  columnPadding = 16,
  data,
  noDataMessage = 'Nothing found',
  noDataIcon = <Icon name='no-accounts' size={40} />,
  onSort
}: TableProps) => {
  const [sortQuery, setSortQuery] = useState<SortQuery>({
    field: '',
    mode: 0
  });
  const sortedData: TableRowProps[] = onSort
    ? data
    : sortData(
      data,
      sortQuery,
      columns.find((column) => column.field === sortQuery.field)
        ?.compareFunc
    );
  return (
    <TableStyled className='unique-table'>
      <div className='unique-table-header'>
        {columns.map(
          (
            {
              title,
              width,
              field,
              iconLeft,
              iconRight,
              isSortable
            },
            columnIndex
          ) => {
            const hasIcon = iconLeft || iconRight;
            const isQueryField = field === sortQuery.field;
            const isInitialMode = sortQuery.mode === 0;
            return (
              <div
                className={classNames('table-header-cell', {
                  'with-icon': hasIcon || isSortable,
                  'to-left': iconLeft,
                  'to-right': iconRight || isSortable,
                  sortable: isSortable,
                  active: isQueryField && !isInitialMode
                })}
                key={`${field}-${columnIndex}`}
                style={{
                  width: `calc(${width} - ${columnPadding}px)`,
                  paddingLeft: `${columnPadding / 2}px`,
                  paddingRight: `${columnPadding / 2}px`
                }}
              >
                {title}
                {isSortable && (
                  <div
                    className='table-header-sorter'
                    onClick={() => {
                      const columnQuery = {
                        field,
                        mode: isQueryField
                          ? (sortQuery.mode + 1) % 3
                          : 1
                      };
                      setSortQuery(columnQuery);
                      onSort?.(columnQuery);
                    }}
                  >
                    <Icon
                      name={`sorting-${
                        SORT_MODES[
                          isQueryField
                            ? sortQuery.mode
                            : 0
                          ]
                      }`}
                      size={14}
                    />
                  </div>
                )}
                {hasIcon && <Icon {...hasIcon} />}
              </div>
            );
          }
        )}
      </div>
      {sortedData.length
        ? (<div className='unique-table-data'>
          {sortedData.map((row, rowIndex) => (
            <TableRow
              key={row.key || rowIndex}
              row={row}
              rowIndex={rowIndex}
              columns={columns}
              columnPadding={columnPadding}
            />
          ))}
        </div>
      )
      : (
        noDataMessage && (
          <div className='unique-table-no-data'>
            {noDataIcon}
            <Text
              color='var(---color-blue-grey-500)'
              size='m'
              weight='light'
            >
              {noDataMessage}
            </Text>
          </div>
        )
      )}
    </TableStyled>
  );
};

const TableStyled = styled.div`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  display: flex;
  flex-direction: column;
  font-style: normal;

  .unique-table-header {
    font-weight: 500;
    display: flex;
    align-items: center;
    height: 40px;
    background-color: var(--color-blue-grey-100);
    color: var(--color-blue-grey-600);

    .table-header-cell {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 0 16px;

      &.sortable .table-header-sorter {
        cursor: pointer;
        height: 14px;

        &:hover svg {
          fill: var(--color-primary-500);
        }
      }

      &.active svg {
        fill: var(--color-primary-500);
      }
    }
  }

  .unique-table-data {
    .unique-table-data-row {
      display: flex;
      align-items: center;
      min-height: 40px;
      flex-direction: row;

      & > div {
        padding: 0 16px;

        a {
          font-weight: inherit;
        }
      }
    }
  }

  &-no-data {
    margin-top: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
  }
`;
