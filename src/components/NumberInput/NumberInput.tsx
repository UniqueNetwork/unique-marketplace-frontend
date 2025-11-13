import React, { FC, useCallback } from 'react';
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

export const NumberInput: FC<AmountInputProps> = ({
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
    
    // Allow empty string - always pass it through
    if (!_value || _value === '') {
      onChange('');
      return;
    }
    
    // Remove any non-numeric characters except decimal point
    let cleanedValue = _value.replace(/[^\d.]/g, '');
    
    // If after cleaning we have nothing, allow empty
    if (!cleanedValue) {
      onChange('');
      return;
    }
    
    // Remove multiple decimal points, keep only the first one
    const dotIndex = cleanedValue.indexOf('.');
    if (dotIndex !== -1) {
      const beforeDot = cleanedValue.substring(0, dotIndex + 1);
      const afterDot = cleanedValue.substring(dotIndex + 1).replace(/\./g, '');
      cleanedValue = beforeDot + afterDot;
    }
    
    // Limit decimal places
    if (cleanedValue.includes('.')) {
      const parts = cleanedValue.split('.');
      if (parts[1] && parts[1].length > decimals) {
        cleanedValue = parts[0] + '.' + parts[1].substring(0, decimals);
      }
    }
    
    // Remove leading zeros (except for "0" or "0.")
    if (cleanedValue.length > 1 && cleanedValue.startsWith('0') && !cleanedValue.startsWith('0.')) {
      cleanedValue = cleanedValue.replace(/^0+/, '') || '0';
    }
    
    // Limit integer part to 10 digits
    const dotPos = cleanedValue.indexOf('.');
    const integerPart = dotPos !== -1 ? cleanedValue.substring(0, dotPos) : cleanedValue;
    if (integerPart.length > 10) {
      const limitedInteger = integerPart.substring(0, 10);
      cleanedValue = dotPos !== -1 ? limitedInteger + cleanedValue.substring(dotPos) : limitedInteger;
    }
    
    // Always pass through the cleaned value - let the parent component validate if needed
    // This allows any valid numeric input like "1", "12", "12.", "12.3", "0", "0.5", etc.
    onChange(cleanedValue);
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
      value={value || ''}
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
