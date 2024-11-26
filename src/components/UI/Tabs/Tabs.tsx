import classNames from 'classnames';
import styled from 'styled-components';
import { ComponentProps } from '../types';

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
  testid,
}: TabsProps) => {
  const numberOfTabs = labels ? labels.length : children ? children.length : 0;

  return (
    <TabsContainer data-testid={testid} type={type}>
      {labels && (
        <TabLabels numberOfTabs={numberOfTabs}>
          {labels.map((label, index) => {
            const disabled = disabledIndexes?.includes(index);
            return (
              <TabLabel
                key={`tab-label-${index}`}
                onClick={() => {
                  if (!disabled) {
                    onClick?.(index);
                  }
                }}
                active={activeIndex === index}
                disabled={disabled}
                data-testid={`${testid}-${label}`}
                numberOfTabs={numberOfTabs}
              >
                {label}
              </TabLabel>
            );
          })}
        </TabLabels>
      )}
      {children && <TabContent>{children[activeIndex]}</TabContent>}
    </TabsContainer>
  );
};

const TabsContainer = styled.div<{ type: 'default' | 'slim' }>`
  /* Container styles if needed */
`;

const TabLabels = styled.div<{ numberOfTabs: number }>`
  display: flex;
  flex-wrap: wrap;
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: 500;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-grey-300);

  @media (max-width: 768px) {
    ${(props) =>
      props.numberOfTabs > 2 &&
      `
      flex-direction: column;
      overflow-y: auto;
      max-height: 200px; /* Adjust as needed */
    `}
  }
`;

const TabLabel = styled.div<{
  active: boolean;
  disabled?: boolean;
  numberOfTabs: number;
}>`
  position: relative;
  padding: 12px 24px;
  margin-right: 32px;
  cursor: pointer;
  color: ${(props) =>
    props.disabled
      ? 'var(--color-grey-400)'
      : props.active
      ? 'var(--color-primary-500)'
      : 'var(--color-blue-grey-500)'};
  transition: color 0.3s;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  white-space: nowrap; /* Prevent text from wrapping */

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: ${(props) => (props.active ? '100%' : '0%')};
    height: 2px;
    background-color: var(--color-primary-500);
    transition: width 0.3s;
  }

  &:hover {
    color: ${(props) =>
      props.disabled ? 'var(--color-grey-400)' : 'var(--color-primary-500)'};

    &::after {
      width: ${(props) => (props.disabled ? '0%' : '100%')};
    }
  }

  &:last-child {
    margin-right: 0;
  }

  @media (max-width: 768px) {
    ${(props) =>
      props.numberOfTabs > 2 &&
      `
      width: 100%;
      margin-right: 0;
    `}
  }
`;

const TabContent = styled.div`
  padding: 24px 0;
`;
