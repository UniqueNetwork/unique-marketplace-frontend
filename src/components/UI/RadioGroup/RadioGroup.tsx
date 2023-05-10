import classNames from 'classnames';
import { forwardRef, LegacyRef, ReactNode, useState } from 'react';
import styled from 'styled-components';

export type RadioOptionValueType = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export interface RadioGroupProps {
  label?: string;
  additionalText?: string;
  options: RadioOptionValueType[];
  size?: 's' | 'm';
  align?: 'vertical' | 'horizontal';
  onChange?: (value: RadioOptionValueType) => void;
  value?: string;
  defaultValue?: string | null;
}

export const RadioGroup = forwardRef(
  (
    {
      label,
      additionalText,
      options,
      onChange,
      value: userValue,
      size = 's',
      align = 'vertical',
      defaultValue = null
    }: RadioGroupProps,
    ref: LegacyRef<HTMLInputElement>
  ) => {
    const [defaultRadioValue, setDefaultRadioValue] = useState(() => {
      if (!defaultValue && !userValue) {
        return options[0]?.value ?? null;
      }
      return defaultValue;
    });

    const handleChange = (radio: RadioOptionValueType) => {
      if (defaultRadioValue) {
        setDefaultRadioValue(radio.value);
      }
      onChange?.(radio);
    };

    return (
      <RadioGroupWrapper className={`unique-radio-group-wrapper ${align}`}>
        {label && <label>{label}</label>}
        {additionalText && (
          <div className='additional-text'>{additionalText}</div>
        )}
        {options.map((radio) => {
          const { disabled, value: radioValue, label } = radio;
          const value = defaultRadioValue ?? userValue;

          const isChecked = radioValue === value;
          return (
            <div
              className={classNames('unique-radio-item', `radio-size-${size}`, {
                disabled
              })}
              key={radioValue}
            >
              <label htmlFor={radioValue}>
                <input
                  type='radio'
                  id={radioValue}
                  checked={isChecked}
                  hidden={true}
                  disabled={disabled}
                  ref={ref}
                  onChange={() => handleChange(radio)}
                />
                <span
                  className={classNames('inner', {
                    checked: isChecked
                  })}
                />
                <span className='label'>{label}</span>
              </label>
            </div>
          );
        })}
      </RadioGroupWrapper>
    );
  }
);

const RadioGroupWrapper = styled.div`
  display: flex;
  
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

  &.vertical {
    flex-direction: column;

    .unique-radio-item {
      & + .unique-radio-item {
        margin-top: 15px;
      }
    }
  }

  &.horizontal {
    flex-direction: row;

    .unique-radio-item {
      & + .unique-radio-item {
        margin-left: 15px;
      }
    }
  }

  .unique-radio-item {
    font-family: var(--prop-font-family);
    font-size: var(--prop-font-size);
    font-weight: var(--prop-font-weight);
    position: relative;

    .label {
      margin-left: 28px;
    }

    .inner {
      position: absolute;
      box-sizing: border-box;
      border: 1px solid var(--color-grey-300);
      border-radius: 30px;
    }

    .inner.checked {
      border: 2px solid var(--color-primary-500);
      &:after {
        content: '';
        position: absolute;
        background-color: var(--color-primary-500);
        border-radius: 30px;
      }
    }

    label {
      display: inline-flex;
      align-items: center;
      color: var(--color-secondary-500);
      cursor: pointer;

      &:hover .inner {
        border-color: var(--color-primary-500);
      }
    }

    &.disabled {
      cursor: default;
      .inner {
        &.checked {
          border: 2px solid var(--color-grey-300);
          &:after {
            background-color: var(--color-grey-300);
          }
        }
      }
      &:hover {
        .inner {
          border-color: var(--color-grey-300);
        }
      }
      label {
        color: var(--color-blue-grey-300);
        cursor: default;
      }
    }

    &.radio-size {
      &-s {
        .inner {
          width: 20px;
          height: 20px;
          &.checked::after {
            height: 12px;
            width: 12px;
            top: 2px;
            left: 2px;
          }
        }
        label {
          font-size: var(--prop-font-size);
        }
      }
      &-m {
        .inner {
          width: 23px;
          height: 23px;
          &.checked::after {
            height: 13px;
            width: 13px;
            top: 3px;
            left: 3px;
          }
        }
        label {
          font-size: 16px;
        }
      }
    }
  }
`;
