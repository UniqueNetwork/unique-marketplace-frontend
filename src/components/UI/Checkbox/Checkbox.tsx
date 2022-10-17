import classNames from 'classnames';
import { Icon, IconProps } from '../Icon/Icon';
import { ReactNode, forwardRef, LegacyRef } from 'react';
import { ComponentProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';

export interface CheckboxProps extends Omit<ComponentProps, 'onChange'> {
  checked: boolean;
  label: ReactNode;
  size?: 's' | 'm';
  disabled?: boolean;
  onChange: (value: boolean) => void;
  iconRight?: IconProps;
  iconLeft?: IconProps;
  testid: string;
}

export const Checkbox = forwardRef(
  (
    {
      id,
      name,
      checked,
      label,
      disabled,
      size = 's',
      onChange,
      iconRight,
      iconLeft,
      testid
    }: CheckboxProps,
    ref: LegacyRef<HTMLInputElement>
  ) => {
    const icon = iconLeft || iconRight;
    return (
      <CheckboxStyled
        className={classNames(
          'unique-checkbox-wrapper',
          `checkbox-size-${size}`,
          { disabled }
        )}
        {...(!disabled && {
          onClick: () => onChange(!checked)
        })}
      >
        <input
          type='checkbox'
          name={name}
          id={id}
          className='checkbox'
          checked={checked}
          ref={ref}
          onChange={(e) => e.preventDefault()}
          data-testid={`${testid}-${name || label}`}
        />
        <span className={classNames('checkmark', { checked })}>
          {checked && (
            <Icon
              name='checked'
              color='#fff'
              size={size === 's' ? 16 : 18}
            />
          )}
        </span>

        <label
          className={classNames('checkbox-label', {
            'icon-left': iconLeft,
            'icon-right': iconRight
          })}
        >
          {icon && <Icon {...icon} />}
          <span>{label}</span>
        </label>
      </CheckboxStyled>
    );
  }
);

const CheckboxStyled = styled.div`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  position: relative;
  display: flex;
  cursor: pointer;
  align-items: flex-start;

  input {
    display: none;
  }

  &:hover .checkmark {
    border-color: var(--color-primary-500);
  }

  .checkmark {
    position: absolute;
    box-sizing: border-box;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--prop-border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkmark.checked {
    background-color: var(--color-primary-500);
    border: 1px solid var(--color-primary-500);
  }

  label {
    display: flex;
    font-size: var(--prop-font-size);
    font-weight: var(--prop-font-weight);
    color: var(--color-secondary-500);
    cursor: pointer;
    line-height: 22px;
    word-break: break-word;
  }

  &.disabled {
    .checkmark {
      background-color: var(--color-grey-300);
      &.checked {
        background-color: var(--color-grey-300);
        border: 1px solid var(--color-grey-300);
      }
    }
    label {
      color: var(--color-blue-grey-300);
    }
  }

  &.checkbox-size {
    &-s {
      .checkmark {
        width: 20px;
        height: 20px;
      }
      label {
        font-size: var(--prop-font-size);
        margin-left: 28px;
      }
    }

    &-m {
      .checkmark {
        width: 22px;
        height: 22px;
      }
      label {
        font-size: 16px;
        margin-left: 30px;
      }
    }
  }

  .checkbox-label {
    svg,
    img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
    }
  }

  .icon-left {
    svg,
    img {
      margin-right: 4px;
    }
  }

  .icon-right {
    flex-direction: row-reverse;
    svg,
    img {
      margin-left: 4px;
    }
  }
`;
