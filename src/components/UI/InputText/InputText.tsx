import { ForwardedRef, forwardRef, ReactNode } from 'react';
import classNames from 'classnames';
import { ComponentProps, DimentionType } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { IconType, userIcon } from '../Icon/Icon';

export interface InputBaseProps {
  additionalText?: string;
  error?: boolean;
  label?: ReactNode;
  statusText?: string;
  size?: DimentionType;
  onChange?(value: string): void;
}

export type InputTextProps = InputBaseProps &
  Omit<ComponentProps, 'onChange'> & {
  iconLeft?: IconType;
  iconRight?: IconType;
  role?: 'number' | 'decimal';
};

export const InputText = forwardRef(
  (
    {
      id,
      label,
      additionalText,
      statusText,
      className,
      error,
      disabled,
      value = '',
      iconLeft,
      iconRight,
      onChange,
      role,
      size = 'middle',
      testid,
      ...rest
    }: InputTextProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => (
    <InputTextStyled
      className={classNames(
        'unique-input-text',
        `size-${size}`,
        className,
        { error }
      )}
    >
      {label && <label htmlFor={id}>{label}</label>}
      {additionalText && (
        <div className='additional-text'>{additionalText}</div>
      )}
      <div
        className={classNames('input-wrapper', {
          'with-icon': iconLeft || iconRight,
          'to-left': iconLeft,
          'to-right': iconRight,
          disabled
        })}
      >
        {userIcon(iconLeft)}
        <input
          type={'text'}
          id={id}
          disabled={disabled}
          value={value}
          ref={ref}
          data-testid={testid}
          {...(onChange && {
            onChange: (e) =>
              onChange(
                role === 'number' ? e.target.value.replace(/\D/g, '') : e.target.value
              )
          })}
          {...rest}
        />
        {userIcon(iconRight)}
      </div>
      {statusText && <div className='status-text'>{statusText}</div>}
    </InputTextStyled>
  )
);

const InputTextStyled = styled.div`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  position: relative;
  width: 250px;

  label {
    color: var(--color-secondary-500);
    display: block;
    font-size: 16px;
    font-weight: 600;
    height: 24px;
    line-height: 24px;
    margin-bottom: 5px;
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .additional-text {
    color: var(--color-grey-500);
    font-size: 14px;
    height: 22px;
    line-height: 22px;
    margin-bottom: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .status-text {
    color: var(--color-grey-500);
    font-size: 14px;
    line-height: 22px;
    margin-top: 8px;
    min-height: 22px;
    width: 100%;
  }

  &.error,
  &.error:focus-within {
    .input-wrapper {
      border: 1px solid var(--color-coral-500);
    }
    .status-text {
      color: var(--color-coral-500);
    }
  }

  .input-wrapper {
    position: relative;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--prop-border-radius);
    display: flex;
    align-items: center;

    &:focus-within {
      border: 1px solid var(--color-grey-400);
    }

    &.disabled {
      background-color: var(--color-grey-100);

      input {
        color: var(--color-blue-grey-400);
      }
    }

    input {
      color: var(--color-secondary-500);
      outline: none;
      padding: 11px 12px;
      width: calc(100% - 24px);
      border: none;
      background: none;
      font-family: var(--prop-font-family);
      &::placeholder {
        color: var(--color-grey-400);
      }
    }

    &.with-icon {
      svg {
        position: relative;
        margin: 0 10px;
      }
      &.to-left:not(.to-right) {
        input {
          padding: 11px 12px 11px 0;
          width: calc(100% - 50px);
        }
      }
      &.to-right:not(.to-left) {
        input {
          padding: 11px 0 11px 12px;
          width: calc(100% - 50px);
        }
      }
      &.to-left.to-right {
        input {
          padding: 11px 12px 11px 0;
          width: calc(100% - 88px);
        }
      }
    }
  }

  &.size-middle {
    input {
      padding: 11px 12px;
    }
  }

  &.size-small {
    input {
      padding: 7px 12px;
    }
  }
`;
