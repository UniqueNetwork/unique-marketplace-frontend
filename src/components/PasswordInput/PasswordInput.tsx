import React, { ChangeEvent, FCC, useCallback, useState } from 'react';
import styled from 'styled-components';

import { Grey300, Grey500 } from '../../styles/colors';
import { IconButton } from '../IconButton/IconButton';

interface PasswordInputProps {
  placeholder?: string
  value: string
  maxLength?: number
  onChange(value: string): void
  testid: string
}

export const PasswordInput: FCC<PasswordInputProps> = ({ placeholder, value, onChange, maxLength = 40, testid }) => {
  const [isVisibleValue, setIsVisibleValue] = useState<boolean>(false);

  const onPasswordChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.value.length > maxLength) return;
    onChange(target.value);
  }, [onChange, maxLength]);

  const onVisibleValueClick = useCallback(() => {
    setIsVisibleValue(!isVisibleValue);
  }, [isVisibleValue]);

  return (
    <PasswordInputWrapper>
      <PasswordInputStyled
        data-testid={`${testid}-input`}
        type={isVisibleValue ? 'text' : 'password'}
        onChange={onPasswordChange}
        value={value}
        placeholder={placeholder}
      />
      {value && <IconButton
        name={isVisibleValue ? 'eye' : 'eye-closed'}
        onClick={onVisibleValueClick}
        size={24}
        testid={`${testid}-clear-button`}
      />}
    </PasswordInputWrapper>
  );
};

const PasswordInputWrapper = styled.div`
  border: 1px solid ${Grey300};
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding-right: calc(var(--prop-gap) / 2);
  &:focus, &:hover {
    border: 1px solid var(--color-grey-500);
  }
`;

const PasswordInputStyled = styled.input`
  border: none;
  padding: 11px 12px;
  flex-grow: 1;
  outline: 0px none transparent;
  background-color: transparent;
  &::placeholder {
    color: ${Grey500};
  }
`;
