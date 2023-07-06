import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Icon, InputText } from '..';
import { Text } from '@unique-nft/ui-kit';
import { Select } from 'components/UI';
import { usePrevious } from 'utils/uiUtils';
import styled from 'styled-components';

export interface IPaginationProps {
  size: number;
  current?: number;
  visible?: number;
  perPage?: number;
  pageSizes?: number[];
  withIcons?: boolean;
  withPageSelector?: boolean;
  withPerPageSelector?: boolean;
  onPageChange: (index: number) => void;
  onGoToPage?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
  testid?: string;
}

export interface IPageItemProps {
  className: string;
  page?: number;
  children?: JSX.Element;
  onClick?: () => void;
  testid?: string;
}

const PageItem = ({ children, page, testid, ...rest }: IPageItemProps) => (
  <div data-testid={testid} {...rest}>{children || page}</div>
);

export const Pagination = ({
  size,
  current = 0,
  visible = 5,
  perPage,
  pageSizes = [10, 20, 50, 100],
  withIcons,
  withPageSelector,
  withPerPageSelector,
  onPageChange,
  onGoToPage,
  onPageSizeChange,
  testid
}: IPaginationProps) => {
  const isMobile = visible === 2;
  const [currentIndex, setCurrentIndex] = useState<number>(current);
  const [perPageCount, setPerPageCount] = useState<number>(pageSizes[0]);
  const [currentSelector, setCurrentSelector] = useState<string>('');
  const prevIndex: number = usePrevious<number>(currentIndex);
  const totalCount = Math.ceil(size / perPageCount);

  useEffect(() => {
    setPerPageCount(perPage || pageSizes[0]);
  }, [perPage]);

  const isOffsetable = totalCount > 3 && visible < totalCount;
  const hasLeftOffset =
    isOffsetable && currentIndex > (isMobile ? 1 : (visible - 1) / 2);
  const hasRightOffset =
    isOffsetable &&
    currentIndex < totalCount - (isMobile ? 1 : (visible - 1) / 2) - 1;
  const actualCount = isOffsetable
    ? Math.min(
      hasLeftOffset && hasRightOffset
        ? isMobile
          ? 1
          : visible - 2
        : visible,
      totalCount
    )
    : totalCount;
  const actualDelta = isMobile ? 2 : (actualCount - 1) / 2;
  const initialIndex = !isOffsetable
    ? 0
    : currentIndex < actualDelta
      ? 0
      : currentIndex + actualDelta >= totalCount
        ? totalCount - actualCount
        : isMobile
          ? currentIndex
          : currentIndex - actualDelta;

  useEffect(() => {
    prevIndex !== undefined && onPageChange(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(current);
  }, [current]);

  return (
    <PaginationStyled className='unique-pagination-wrapper'>
      {withPerPageSelector && (
        <div className='per-page-selector-wrapper'>
          <Text weight={'light'} testid={`${testid}-items-count`}>{size} items</Text>
          <Text weight={'light'}>Results on the page</Text>
          <Select
            testid={`${testid}-page-size-select`}
            options={pageSizes.map((option) => ({
              id: option.toString(),
              title: option.toString()
            }))}
            size='small'
            value={perPageCount.toString()}
            onChange={(option) => {
              const [selectOption] = Array.isArray(option)
                ? option
                : [option];
              const pageCount = Number(selectOption.title);
              setPerPageCount(pageCount);
              setCurrentIndex(0);
              setCurrentSelector('');
              onPageSizeChange?.(pageCount);
            }}
          />
        </div>
      )}
      <div className='pages-wrapper'>
        {withIcons && (
          <PageItem
            {...(currentIndex !== 0 && {
              onClick: () => {
                currentSelector && setCurrentSelector('');
                setCurrentIndex(currentIndex - 1);
              }
            })}
            className={classNames('page-item', {
              disabled: currentIndex === 0
            })}
            testid={`${testid}-previous-page`}
          >
            <Icon name='carret-left' size={12} />
          </PageItem>
        )}
        {hasLeftOffset && (
          <>
            <PageItem
              page={1}
              onClick={() => {
                currentSelector && setCurrentSelector('');
                setCurrentIndex(0);
              }}
              className='page-item'
              testid={`${testid}-page-1`}
            />
            <div className='page-ellipsis'>...</div>
          </>
        )}
        {[...new Array(actualCount)].map((_, index) => {
          const offsetIndex = initialIndex + index;
          return (
            <PageItem
              page={offsetIndex + 1}
              onClick={() => {
                currentSelector && setCurrentSelector('');
                setCurrentIndex(offsetIndex);
              }}
              key={offsetIndex}
              className={classNames('page-item', {
                active: offsetIndex === currentIndex
              })}
              testid={`${testid}-page${offsetIndex + 1}`}
            />
          );
        })}
        {hasRightOffset && (
          <>
            <div className='page-ellipsis'>...</div>
            <PageItem
              page={totalCount}
              onClick={() => {
                setCurrentIndex(totalCount - 1);
                currentSelector && setCurrentSelector('');
              }}
              className='page-item'
              testid={`${testid}-page-${totalCount}`}
            />
          </>
        )}
        {withIcons && (
          <PageItem
            {...(currentIndex !== totalCount - 1 && {
              onClick: () => {
                currentSelector && setCurrentSelector('');
                setCurrentIndex(currentIndex + 1);
              }
            })}
            className={classNames('page-item', {
              disabled: currentIndex === totalCount - 1
            })}
            testid={`${testid}-next-page`}
          >
            <Icon name='carret-right' size={12} />
          </PageItem>
        )}
      </div>
      {withPageSelector && (
        <div className='page-selector-wrapper'>
          Go to:
          <InputText
            maxLength={5}
            value={currentSelector}
            role='number'
            size='small'
            onChange={(index) => setCurrentSelector(`${index}`)}
            onKeyDown={(e) => {
              if (
                e.code === 'Enter' &&
                Number(currentSelector) > 0
              ) {
                const page =
                  Number(currentSelector) === 0
                    ? 1
                    : Number(currentSelector) > totalCount
                      ? totalCount
                      : Number(currentSelector);
                setCurrentIndex(page - 1);
                onGoToPage?.(page);
              }
            }}
            testid={`${testid}-page-input`}
          />
        </div>
      )}
    </PaginationStyled>
  );
};

const PaginationStyled = styled.div`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;

  .pages-wrapper {
    display: flex;
    align-items: center;

    .page-item {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      min-width: 20px;
      padding: 4px 6px;
      height: 24px;
      cursor: pointer;
      color: var(--color-secondary-500);

      svg.icon {
        fill: var(--color-secondary-500);
      }

      &:hover {
        color: var(--color-primary-500);
        svg {
          fill: var(--color-primary-500);
        }
      }

      &.active {
        background-color: var(--color-primary-500);
        color: var(--color-additional-light);
        border-radius: var(--prop-border-radius);
      }

      &.disabled {
        cursor: default;
        svg {
          fill: var(--color-blue-grey-300);
        }
      }
    }

    .page-ellipsis {
      width: 32px;
      text-align: center;
      color: var(--color-blue-grey-300);
    }
  }

  .page-selector-wrapper {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: 40px;

    .unique-input-text {
      width: 70px;
    }
  }

  .per-page-selector-wrapper {
    display: flex;
    gap: calc(var(--prop-gap) / 2);
    align-items: center;
    margin-right: 40px;
    .unique-text:first-child {
      padding-right: var(--prop-gap);
    }
    .unique-select {
      width: 70px;
    }
  }
`;
