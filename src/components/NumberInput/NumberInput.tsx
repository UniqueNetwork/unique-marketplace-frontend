import React, { FC, useCallback } from 'react';
import { InputText } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { IconButton } from '../IconButton/IconButton';

interface AmountInputProps {
  value: string | undefined
  onChange(value: string): void
  placeholder?: string
  decimals?: number
  label?: string
  className?: string
}

export const NumberInput: FC<AmountInputProps> = ({ value, onChange, placeholder, decimals = 6, label, className }) => {
  const onChangeInput = useCallback((_value: string) => {
    if (_value === '') onChange(_value);
    // regExp to check value according to valid number format
    const regExp = new RegExp(`^([1-9]\\d{0,4}|0)(\\.\\d{0,${decimals}})?$`);
    // check value is correct
    if (_value.length > 1 && _value.startsWith('0') && !_value.startsWith('0.')) _value = _value.replace('0', '');
    if (regExp.test(_value.trim())) {
      onChange(_value.trim());
    }
  }, [onChange, decimals]);

  const onClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return <InputWrapper className={className}>
    <InputText
      placeholder={placeholder}
      onChange={onChangeInput}
      value={value}
      label={label}
    />
    {value && <ClearButton name={'close'} size={16} onClick={onClear} />}
  </InputWrapper>;
};

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
  .unique-input-text {
    width: auto;
    input {
      padding-right: 22px;
    }
  }
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: calc(var(--gap) / 2);
  top: 50%;
  margin-top: -8px;
  width: auto !important;
`;
