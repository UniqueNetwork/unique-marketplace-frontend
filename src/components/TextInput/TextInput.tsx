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
  allowSpaces?: boolean
}

export const TextInput: FC<TextInputProps> = ({ value, onChange, placeholder, label, className, iconLeft, errorText, allowSpaces }) => {
  const onChangeInput = useCallback((_value: string) => {
    if (!allowSpaces) onChange(_value.trim());
    else onChange(_value);
  }, [onChange, allowSpaces]);

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
      statusText={errorText}
      error={!!errorText}
      iconRight={value ? <ClearButton name={'circle-close'} size={24} onClick={onClear} /> : null}
    />
  </InputWrapper>;
};

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
  .unique-input-text {
    width: auto;
    div.input-wrapper.with-icon > input {
      padding-right: 36px;
    }
  }
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: 0;
  bottom: 5px;
  width: auto !important;
`;
