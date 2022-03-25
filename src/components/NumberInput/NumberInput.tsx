import React, { FC, useCallback } from 'react';
import { InputText } from '@unique-nft/ui-kit';

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

  return <InputText
    placeholder={placeholder}
    onChange={onChangeInput}
    value={value}
    label={label}
    className={className}
  />;
};
