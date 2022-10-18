import classNames from 'classnames';
import { ComponentProps, DimentionType, IconProps } from '@unique-nft/ui-kit';
import { Icon } from '..';
import styled from 'styled-components';
import React from 'react';

export interface ButtonBaseProps {
  title: string;
  size?: DimentionType;
  role?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outlined'
    | 'danger'
    | 'ghost';
  type?: 'submit' | 'button';
  wide?: boolean;
  iconLeft?: IconProps;
  iconRight?: IconProps;
  link?: string;
  onClick?: () => void;
}

export type ButtonProps = ButtonBaseProps &
  Pick<
    ComponentProps,
    'className' | 'disabled' | 'id' | 'tabIndex' | 'testid'
    >;

export const Button = ({
  title,
  disabled,
  wide,
  size = 'middle',
  role = 'outlined',
  className,
  iconLeft,
  iconRight,
  type = 'button',
  link,
  onClick,
  testid
}: ButtonProps) => {
  const icon = iconLeft || iconRight;
  const ButtonStyled: any = link ? aStyled : buttonsStyled;
  return (
    <ButtonStyled
      className={classNames(
        'unique-button',
        role,
        `size-${size}`,
        className,
        {
          disabled,
          wide,
          'with-icon': icon,
          'to-left': iconLeft,
          'to-right': iconRight
        }
      )}
      onClick={onClick}
      type={type}
      href={link}
      disabled={disabled}
      data-testid={testid}
    >
      {title}
      {icon && <Icon {...icon} />}
    </ButtonStyled>
  );
};

const styles = `
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--prop-border-radius);
  cursor: pointer;
  border-width: 1px;
  border-style: solid;
  text-decoration: none;
  white-space: nowrap;

  &.primary {
      background: var(--color-primary-500);
      border-color: var(--color-primary-500);
      color: var(--color-additional-light);
      &:hover {
          background: var(--color-primary-400);
          border-color: var(--color-primary-400);
      }
      &:active {
          background: var(--color-primary-600);
          border-color: var(--color-primary-600);
      }
  }

  &.secondary {
      background: var(--color-secondary-500);
      border-color: var(--color-secondary-500);
      color: var(--color-additional-light);
      &:hover {
          background: var(--color-secondary-400);
          border-color: var(--color-secondary-400);
      }
      &:active {
          background: var(--color-secondary-600);
          border-color: var(--color-secondary-600);
      }
  }

  &.outlined {
      background: var(--color-additional-light);
      border-color: var(--color-primary-500);
      color: var(--color-primary-500);
      &:hover {
          background: var(--color-primary-100);
          color: var(--color-primary-400);
          border-color: var(--color-primary-400);
      }
      &:active {
          color: var(--color-primary-600);
          border-color: var(--color-primary-600);
      }
  }

  &.tertiary {
      background: var(--color-additional-light);
      border-color: var(--color-grey-500);
      color: var(--color-grey-500);
      &:hover {
          background: var(--color-blue-grey-100);
          border-color: var(--color-grey-400);
      }
      &:active {
          color: var(--color-grey-600);
          border-color: var(--color-grey-600);
      }
  }

  &.danger {
      color: var(--color-coral-500);
      border-color: var(--color-coral-500);
      background: var(--color-additional-light);
      &:hover {
          background: var(--color-coral-100);
          border-color: var(--color-coral-400);
      }
      &:active {
          background: var(--color-additional-light);
          border-color: var(--color-coral-600);
          color: var(--color-coral-600);
      }
  }

  &.ghost {
      border: none;
      background: none;
      color: var(--color-blue-grey-500);
  }

  &.disabled,
  &.disabled:hover,
  &.disabled:active {
      cursor: default;
      color: var(--color-blue-grey-300);

      &:not(.ghost) {
          border-color: var(--color-blue-grey-300);
          background: var(--color-grey-100);
      }

      & > svg {
          fill: var(--color-blue-grey-300);
      }
  }

  &.size-middle {
      padding: 8px 24px;
      font-size: 16px;
      height: 40px;
      line-height: 40px;
  }

  &.size-small {
      padding: 5px 16px;
      font-size: 14px;
      height: 32px;
      line-height: 32px;
  }

  &.wide {
      width: 100%;
  }

  &.with-icon {
      svg {
          position: relative;
      }
      &.to-right {
          flex-direction: row;
          svg {
              margin-left: 10px;
          }
      }
      &.to-left {
          flex-direction: row-reverse;
          svg {
              margin-right: 10px;
          }
      }
  }
`;

const aStyled = styled.a`${styles}`;
const buttonsStyled = styled.button`${styles}`;
