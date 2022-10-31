import classNames from 'classnames';
import { ComponentProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';

export interface ITabsBaseProps {
  activeIndex: number;
  children?: JSX.Element[];
  labels?: string[];
  disabledIndexes?: number[];
  type?: 'default' | 'slim';
  onClick?(activeIndex: number): void;
}

export type TabsProps = ITabsBaseProps & Pick<ComponentProps, 'testid'>;

export const Tabs = ({
  activeIndex,
  labels,
  children,
  disabledIndexes,
  type = 'default',
  onClick,
  testid
}: TabsProps) => (
  <TabsStyled
    className={classNames(type, {
      'unique-tabs-labels': labels,
      'unique-tabs-contents': children
    })}
    data-testid={testid}
  >
    {labels
      ? labels.map((label, index) => {
        const disabled = disabledIndexes?.includes(index);
        return (
          <div
            key={`tab-label-${index}`}
            {...(!disabled && {
              onClick: () => {
                onClick?.(index);
              }
            })}
            className={classNames('tab-label', {
              active: activeIndex === index,
              disabled
            })}
            data-testid={`${testid}-${label}`}
          >
            {label}
          </div>
        );
      })
      : children?.[activeIndex]}
  </TabsStyled>
);

const TabsStyled = styled.div`
  .unique-tabs-labels {
    font-family: var(--prop-font-family);
    font-size: var(--prop-font-size);
    display: flex;
    flex-wrap: wrap;
    font-style: normal;
    font-weight: 500;

    &.slim {
      .tab-label {
        color: var(--color-additional-dark);
        display: flex;
        align-items: center;
        height: 80px;
        padding: 0 20px;
        cursor: pointer;

        &.active {
          border-bottom: 2px solid var(--color-primary-500);
        }
      }
    }

    &.default {
      .tab-label {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 198px;
        height: 38px;
        border: 1px solid var(--color-primary-400);
        line-height: 24px;
        color: var(--color-primary-400);
        cursor: pointer;
        border-left: none;

        &:first-of-type {
          border-top-left-radius: var(--prop-border-radius);
          border-bottom-left-radius: var(--prop-border-radius);
          border-left: 1px solid var(--color-primary-400);
        }

        &:last-of-type {
          border-top-right-radius: var(--prop-border-radius);
          border-bottom-right-radius: var(--prop-border-radius);
        }

        &.disabled {
          background-color: var(--color-grey-100);
          color: var(--color-blue-grey-400);
          border-color: var(--color-blue-grey-300);
          cursor: default;
        }

        &.active {
          color: var(--color-additional-light);
          background-color: var(--color-primary-400);
          border-color: var(--color-primary-400);
        }
      }
    }
  }

  .unique-tab-intermediate {
    font-family: var(--prop-font-family);
    font-size: var(--prop-font-size);
    font-weight: var(--prop-font-weight);
    position: relative;
    padding: 15px;
    margin-top: 15px;
    border-radius: var(--prop-border-radius);
    background-color: var(--color-primary-200);
  }

  .unique-tabs-contents {
    font-family: var(--prop-font-family);
    font-size: var(--prop-font-size);
    font-weight: var(--prop-font-weight);
    position: relative;
    padding: 15px 0;
  }
`;
