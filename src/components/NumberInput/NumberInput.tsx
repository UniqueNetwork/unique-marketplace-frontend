import React, { FCC, useCallback } from 'react';
import { Button, InputText, Loader } from 'components/UI';
import styled from 'styled-components';
import { IconButton } from '../IconButton/IconButton';

interface AmountInputProps {
  disabled?: boolean
  value: string | undefined
  placeholder?: string
  additionalText?: string
  decimals?: number
  label?: string
  className?: string
  testid?: string
  loading?: boolean
  onChange(value: string): void
  onClear?(): void
  onSetMax?(): void
}

export const NumberInput: FCC<AmountInputProps> = ({
  disabled,
  value,
  onChange,
  onSetMax,
  onClear,
  additionalText,
  placeholder,
  decimals = 4,
  label,
  className,
  loading,
  testid = ''
}) => {
  const onChangeInput = useCallback((_value: string) => {
    if (disabled) return;
    if (_value === '') onChange(_value);
    // regExp to check value according to valid number format
    const regExp = new RegExp(`^([1-9]\\d{0,9}|0)(\\.\\d{0,${decimals}})?$`);
    // check value is correct
    if (_value.length > 1 && _value.startsWith('0') && !_value.startsWith('0.')) _value = _value.replace('0', '');
    if (regExp.test(_value.trim())) {
      onChange(_value.trim());
    }
  }, [onChange, decimals, disabled]);

  const onClearClick = useCallback(() => {
    if (disabled) return;
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  return <InputWrapper className={className}>
    <InputText
      disabled={disabled}
      additionalText={additionalText}
      placeholder={placeholder}
      onChange={onChangeInput}
      value={value}
      label={label}
      testid={`${testid}`}
    />
    <ButtonsWrapper>
      {value &&
        <ClearButton
          name={'circle-close'}
          size={16}
          onClick={onClearClick}
          testid={`${testid}-clear-button`}
        />}
      {loading && <Loader size='small' />}
      {onSetMax && <MaxButton
        disabled={disabled}
        role='ghost'
        title='Max'
        onClick={onSetMax}
      />}
    </ButtonsWrapper>
  </InputWrapper>;
};

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
  .unique-input-text {
    width: auto;
    input {
      padding-right: 32px;
    }
  }
`;

const ButtonsWrapper = styled.div`
  position: absolute;
  right: calc(var(--prop-gap) / 2);
  bottom: 0;
  max-width: min-content;
  display: flex;
  align-items: center;
  height: 40px;
  gap: calc(var(--prop-gap) / 4);
`;

const ClearButton = styled(IconButton)`
  && {
    width: auto;
    padding: 4px 0 0 0;
  }
`;

const MaxButton = styled(Button)`
  && {
    padding: 0;
    color: var(--color-primary-500);
    cursor: pointer;
    &:hover {
      color: var(--color-primary-500);
    }
    &.disabled {
      color: var(--color-blue-grey-300);
    }
  }
`;
