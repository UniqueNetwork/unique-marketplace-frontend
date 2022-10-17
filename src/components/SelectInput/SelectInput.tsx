import React, { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AdditionalLight, Grey100, Grey300, Grey500, Primary100, Primary500 } from '../../styles/colors';
import { IconButton } from '../IconButton/IconButton';
import { Icon, IconProps } from '@unique-nft/ui-kit';
import { classNames } from '../../utils/classNames';

interface SelectInputOption {
  key: string
  title: string
}

interface SelectInputProps<T = SelectInputOption> {
  className?: string
  placeholder?: string
  options: T[]
  value?: string | T
  onChange(value: string | T): void
  renderOption?(value: T): ReactNode | string
  isClearable?: boolean
  leftIcon?: IconProps
  testid?: string
  disabled?: boolean
}

export function SelectInput<T = SelectInputOption>({ className, placeholder, options, value, disabled, onChange, renderOption, isClearable, leftIcon, testid }: SelectInputProps<T>) {
  const [selectedValue, setSelectedValue] = useState<T>();
  const [inputValue, setInputValue] = useState<string>('');
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [isCursorInside, setIsCursorInside] = useState<boolean>(false);

  const onInputChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    onChange(target.value);
  }, [onChange]);

  const onInputFocus = useCallback(() => {
    if (disabled) return;
    setIsDropdownVisible(true);
  }, [setIsDropdownVisible, disabled]);

  const onOptionClick = useCallback((option: T) => () => {
    setIsDropdownVisible(false);
    onChange(option);
  }, [onChange]);

  const showOption = useCallback((option: T) => {
    if (renderOption) return renderOption(option);
    if (Object.hasOwnProperty.call(option, 'title')) return (option as unknown as { title: string }).title;
    if (typeof option === 'string' || typeof option === 'number') return option;

    return null;
  }, [renderOption]);

  const onClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  useEffect(() => {
    const onClickOutside = () => {
      if (!isCursorInside) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, [isCursorInside]);

  useEffect(() => {
    if (typeof value === 'string') {
      setSelectedValue(undefined);
      setInputValue(value);
      return;
    }
    setSelectedValue(value as T);
    setInputValue('');
  }, [value, setSelectedValue, setInputValue]);

  const onTriangleButtonClick = useCallback(() => {
    if (disabled) return;
    setIsDropdownVisible(!isDropdownVisible);
  }, [isDropdownVisible, disabled]);

  const onMouseEnter = useCallback(() => {
    setIsCursorInside(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setIsCursorInside(false);
  }, []);

  const onKeyUp = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedValue) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      onClear();
    }
  }, [onClear, selectedValue]);

  return (<SelectInputWrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    <InputWrapper className={classNames({ className, 'left-icon': !!leftIcon, dropped: isDropdownVisible, disabled })} >
      {leftIcon && <Icon {...leftIcon}/>}
      {!selectedValue && !inputValue && placeholder && !isDropdownVisible && <Placeholder>{placeholder}</Placeholder>}
      {selectedValue && <div>
        {showOption(selectedValue)}
      </div>}
      <input
        data-testid={`${testid}-input`}
        type={'text'}
        value={inputValue}
        onChange={onInputChange}
        onFocus={onInputFocus}
        onKeyUp={onKeyUp}
      />
      {(inputValue || (isClearable && value)) &&
        <ClearButton
          name={'circle-close'}
          size={16}
          onClick={onClear}
          testid={`${testid}-clear-button`}
        />
      }
      <TriangleButton
        name={'triangle'}
        onClick={onTriangleButtonClick}
        size={8}
        testid={`${testid}-triangle-button`}
      />
    </InputWrapper>
    {!!options.length && <Dropdown isOpen={isDropdownVisible} data-testid={`${testid}-dropdown`}>
      {options.map((item, index) => (
        <OptionWrapper key={index} onClick={onOptionClick(item)} data-testid={`${testid}-option-${index}`} >{showOption(item)}</OptionWrapper>
      ))}
    </Dropdown>}
  </SelectInputWrapper>);
}

export const SelectInputWrapper = styled.div`
  position: relative;
`;

const InputWrapper = styled.div`
  border: 1px solid ${Grey300};
  box-sizing: border-box;
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  position: relative;
  min-height: 36px;
  input {
    position: absolute;
    top: 0;
    left: 0;
    right: calc(var(--gap) * 2);
    bottom: 0;
    border: none;
    background: transparent;
    outline: none;
    padding: calc(var(--gap) / 2) var(--gap);
    width: -moz-available;
  }

  &.left-icon {
    padding-left: calc(var(--gap) * 2);
    &>.icon {
      position: absolute;
      left: calc(var(--gap) / 2);
    }
    input {
      left: var(--gap);
    }
  }
  
  &.dropped {
    .icon.icon-triangle {
      transform: rotate(180deg);
    }
  }
  
  &.disabled {
    background-color: ${Grey100}
  }
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  position: absolute;
  width: 100%;
  top: calc(100% + 4px);
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
  background: ${AdditionalLight};
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  max-height: 180px;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10;
  padding: calc(var(--gap) / 2);
`;

const OptionWrapper = styled.div`
  padding: 0 calc(var(--gap) / 2);
  cursor: pointer;
  &:hover {
    background: ${Primary100};
    color: ${Primary500};
    .unique-text {
      color: ${Primary500};
    }
  }
`;

const Placeholder = styled.div`
  color: ${Grey500};
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  left: calc(100% - calc(var(--gap) * 2.5));
  top: 50%;
  margin-top: -8px;
  width: auto !important;
`;

const TriangleButton = styled(IconButton)`
  position: absolute;
  top: calc(50% - 4px);
  margin-top: -4px;
  right: calc(var(--gap) / 2);
  cursor: pointer;
`;
