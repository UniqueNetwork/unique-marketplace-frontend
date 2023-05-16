import React, { FC, useCallback } from 'react';
import { Button, InputText } from 'components/UI';
import styled from 'styled-components';
import { IconButton } from '../IconButton/IconButton';
import { Loader } from '@unique-nft/ui-kit';

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
  onSetMax?(): void
}

export const NumberInput: FC<AmountInputProps> = ({
  disabled,
  value,
  onChange,
  onSetMax,
  additionalText,
  placeholder,
  decimals = 6,
  label,
  className,
  loading,
  testid = ''
}) => {
  const onChangeInput = useCallback((_value: string) => {
    if (_value === '') onChange(_value);
    // regExp to check value according to valid number format
    const regExp = new RegExp(`^([1-9]\\d{0,15}|0)(\\.\\d{0,${decimals}})?$`);
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
          onClick={onClear}
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
  right: calc(var(--gap) / 2);
  bottom: 0;
  max-width: min-content;
  display: flex;
  align-items: center;
  height: 40px;
  gap: calc(var(--gap) / 4);
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
