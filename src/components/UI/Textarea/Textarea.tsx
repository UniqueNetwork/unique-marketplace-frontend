import { forwardRef, LegacyRef } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import { ComponentProps } from '@unique-nft/ui-kit';

import { InputBaseProps } from '../InputText/InputText';

interface BaseTextareaProps extends InputBaseProps {
  // number of rows to display in textarea
  rows?: number;
}

export type TextareaProps = BaseTextareaProps & Omit<ComponentProps, 'onChange'>;

export const Textarea = forwardRef(
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
      onChange,
      testid,
      size = 'middle',
      rows = 3,
      ...rest
    }: TextareaProps,
    ref: LegacyRef<HTMLTextAreaElement>
  ) => {
    return (
      <TextareaWrapper
        className={classNames('unique-textarea-text', `size-${size}`, className, {
          error
        })}
      >
        {label && <label htmlFor={id}>{label}</label>}
        {additionalText && <div className='additional-text'>{additionalText}</div>}
        <div
          className={classNames('textarea-wrapper', {
            disabled
          })}
        >
          <textarea
            id={id}
            data-testid={testid}
            disabled={disabled}
            value={value}
            rows={rows}
            ref={ref}
            {...(onChange && {
              onChange: (e) => onChange(e.target.value)
            })}
            {...rest}
          />
        </div>
        {statusText && <div className='status-text'>{statusText}</div>}
      </TextareaWrapper>
    );
  }
);

const TextareaWrapper = styled.div`
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
      .textarea-wrapper {
          border: 1px solid var(--color-coral-500);
      }
      .status-text {
          color: var(--color-coral-500);
      }
  }

  .textarea-wrapper {
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

          textarea {
              color: var(--color-blue-grey-400);
          }
      }

      textarea {
          color: var(--color-secondary-500);
          outline: none;
          padding: 11px 12px;
          width: calc(100% - 24px);
          border: none;
          background: none;
          font-family: var(--prop-font-family);
          resize: none;
          &::placeholder {
              color: var(--color-grey-400);
          }
      }
  }

  &.size-middle {
      textarea {
          padding: 11px 12px;
      }
  }

  &.size-small {
      textarea {
          padding: 7px 12px;
      }
  }
`;
