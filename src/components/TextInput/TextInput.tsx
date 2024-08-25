import React, { FCC, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { IconButton } from '../IconButton/IconButton';
import { InputText } from 'components/UI';
import { IconProps } from 'components/UI/Icon/Icon';

interface TextInputProps {
  value: string | undefined
  onChange(value: string): void
  placeholder?: string
  label?: string
  className?: string
  iconLeft?: IconProps
  errorText?: string
  allowSpaces?: boolean
  testid?: string
}

export const TextInput: FCC<TextInputProps> = ({ value, onChange, placeholder, label, className, iconLeft, errorText, allowSpaces, testid }) => {
  const onChangeInput = useCallback((_value: string) => {
    if (!allowSpaces) onChange(_value.trim());
    else onChange(_value);
  }, [onChange, allowSpaces]);

  const onClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const iconRight = useMemo(() => {
    if (value) {
      return (
        <ClearButton
          name={'circle-close'}
          size={24}
          onClick={onClear}
          testid={`${testid}-clear-button`}
        />);
    } else return null;
  }, [value, testid, onClear]);

  return <InputWrapper className={className}>
    <InputText
      testid={`${testid}-input`}
      placeholder={placeholder}
      onChange={onChangeInput}
      value={value}
      label={label}
      iconLeft={iconLeft}
      statusText={errorText}
      error={!!errorText}
      iconRight={iconRight}
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
