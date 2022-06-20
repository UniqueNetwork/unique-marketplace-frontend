import React, { FC, useCallback } from 'react';
import { IconProps, InputText } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { IconButton } from '../IconButton/IconButton';

interface TextInputProps {
  value: string | undefined
  onChange(value: string): void
  placeholder?: string
  label?: string
  className?: string
  iconLeft?: IconProps
  errorText?: string
}

export const TextInput: FC<TextInputProps> = ({ value, onChange, placeholder, label, className, iconLeft, errorText }) => {
  const onChangeInput = useCallback((_value: string) => {
    onChange(_value.trim());
  }, [onChange]);

  const onClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return <InputWrapper className={className}>
    <InputText
      placeholder={placeholder}
      onChange={onChangeInput}
      value={value}
      label={label}
      iconLeft={iconLeft}
      iconRight={value ? <ClearButton name={'close'} size={16} onClick={onClear} /> : null}
      statusText={errorText}
      error={!!errorText}
    />
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
  bottom: 10px;
  width: auto !important;
`;
