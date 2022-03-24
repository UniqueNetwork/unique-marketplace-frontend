import React, { FC, useCallback } from 'react';
import { InputText } from '@unique-nft/ui-kit';
import { useApi } from '../../hooks/useApi';

interface AmountInputProps {
  value: string | undefined
  onChange(value: string): void
  placeholder?: string
  decimals?: number
  className?: string
}

export const NumberInput: FC<AmountInputProps> = ({ value, onChange, placeholder, decimals = 12, className }) => {
  const { api } = useApi();

  const onChangeInput = useCallback((_value: string) => {
    if (_value === '') onChange(_value);
    // regExp to check value according to valid number format
    const regExp = new RegExp(`^([1-9]\\d*|0)(\\.\\d{0,${api?.market?.kusamaDecimals || decimals}})?$`);
    // check value is correct
    if (regExp.test(_value.trim())) {
      onChange(_value.trim());
    }
  }, [onChange, decimals]);

  return <InputText
    placeholder={placeholder}
    onChange={onChangeInput}
    value={value}
    className={className}
  />;
};
