import React, { isValidElement, Key, ReactNode, useEffect, useState, MouseEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import { ComponentProps, IconProps, SelectOptionProps } from '@unique-nft/ui-kit';
import { Icon } from 'components/Icon/Icon';

export interface DropdownProps extends Omit<ComponentProps, 'onChange'> {
  open?: boolean;
  options?: SelectOptionProps[];
  optionKey?: string;
  optionValue?: string;
  placement?: 'left' | 'right';
  children: JSX.Element;
  iconLeft?: IconProps | ReactNode;
  iconRight?: IconProps | ReactNode;
  isTouch?: boolean;
  verticalOffset?: number | string;
  onChange?(option: SelectOptionProps): void;
  onOpenChange?(open: boolean): void;
  optionRender?(option: SelectOptionProps, isSelected: boolean): ReactNode;
  dropdownRender?(): ReactNode;
}

export const Dropdown = ({
  id,
  value,
  className,
  disabled,
  options,
  optionKey = 'id',
  optionValue = 'title',
  onChange,
  children,
  optionRender,
  dropdownRender,
  placement = 'left',
  iconLeft,
  iconRight,
  open,
  isTouch,
  verticalOffset,
  onOpenChange
}: DropdownProps) => {
  const selected = options?.find(
    (option) => option[optionKey as keyof SelectOptionProps] === value
  );

  const [dropped, setDropped] = useState<boolean>(!!open);

  useEffect(() => {
    setDropped(!!open);
  }, [open, setDropped]);

  const handleClickOutside = () => {
    document.removeEventListener('mousedown', handleClickOutside);
    setDropped(false);
    onOpenChange?.(false);
  };

  const handleMouseLeave = () => {
    document.addEventListener('mousedown', handleClickOutside);
  };

  const handleMouseEnter = () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };

  const handleOptionSelect = (option: SelectOptionProps) => {
    setDropped(false);
    onOpenChange?.(false);
    onChange?.(option);
  };

  const handleMouseClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (disabled) return;
    setDropped(!dropped);
    onOpenChange?.(!dropped);
  };

  return (
    <DropDownWrapper
      className={classNames('unique-dropdown', className, {
        touch: isTouch
      })}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      id={id}
    >
      <div
        className={classNames('dropdown-wrapper', {
          dropped,
          disabled
        })}
        onClick={handleMouseClick}
        data-testid='dropdown-wrapper'
      >
        {iconLeft &&
          (isValidElement(iconLeft)
  ? (
            iconRight
          )
  : (
    <Icon {...(iconLeft as IconProps)} />
          ))}
        {children}
        {iconRight &&
          (isValidElement(iconRight)
  ? (
            iconRight
          )
  : (
    <Icon {...(iconRight as IconProps)} />
          ))}
      </div>
      {dropped && (
        <div
          className={classNames('dropdown-options', {
            right: placement === 'right',
            touch: isTouch
          })}
          role='listbox'
          {...(verticalOffset && {
            style: {
              top: verticalOffset,
              height: `calc(100vh - (${verticalOffset} + 36px))`
            }
          })}
        >
          {dropdownRender?.()}
          {options?.map((option) => {
            const isSelected =
              option[optionKey as keyof SelectOptionProps] ===
              selected?.[optionKey as keyof SelectOptionProps];
            return (
              <div
                className={classNames('dropdown-option', {
                  selected: isSelected,
                  disabled
                })}
                key={
                  (option)[
                    optionKey
                    ] as Key
                }
                onClick={() => handleOptionSelect(option)}
                role='option'
              >
                {optionRender?.(option, isSelected) ||
                  (option[
                    optionValue as keyof SelectOptionProps
                    ] as string)}
              </div>
            );
          })}
        </div>
      )}
    </DropDownWrapper>
  );
};

const DropDownWrapper = styled.div`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  position: relative;

  &.touch {
    width: 100%;
    .dropdown-wrapper {
      width: fit-content;
    }
    .dropdown-options {
      box-shadow: none;
    }
  }

  .dropdown-wrapper {
    position: relative;
    width: 100%;
    float: right;

    .icon-triangle {
      position: absolute;
      right: var(--prop-gap);
      top: 50%;
      margin-top: -4px;
    }
    &.dropped .icon-triangle {
      transform: rotate(180deg);
    }
  }

  .dropdown-options {
    background-color: var(--color-additional-light);
    border-radius: var(--prop-border-radius);
    padding: 8px;
    position: absolute;
    min-width: calc(100% - 16px);
    left: 0;
    top: calc(100% + 4px);
    z-index: 1;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);

    &.right {
      left: unset;
      right: 0;
    }

    .dropdown-option {
      display: flex;
      align-items: center;
      cursor: pointer;
      min-height: 32px;
      line-height: 32px;
      padding: 0 8px;
      position: relative;
      min-width: calc(100% - 16px);
      white-space: nowrap;

      &:not(:last-child) {
        margin-bottom: 3px;
      }

      &:hover,
      &.selected {
        background-color: var(--color-primary-100);
        color: var(--color-primary-500);
      }
    }
  }
`;
