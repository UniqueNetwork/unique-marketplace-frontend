import React, { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AdditionalLight, Grey300, Grey500, Primary100, Primary500 } from '../../styles/colors';
import { IconButton } from '../IconButton/IconButton';
import { Icon, IconProps } from '@unique-nft/ui-kit';

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
}

export function SelectInput<T = SelectInputOption>({ className, placeholder, options, value, onChange, renderOption, isClearable, leftIcon }: SelectInputProps<T>) {
  const [selectedValue, setSelectedValue] = useState<T>();
  const [inputValue, setInputValue] = useState<string>('');
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const InputRef = useRef<HTMLInputElement>(null);
  const DropdownRef = useRef<HTMLDivElement>(null);

  const onInputChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    onChange(target.value);
  }, [onChange]);

  const onInputFocus = useCallback(() => {
    setIsDropdownVisible(true);
  }, [setIsDropdownVisible]);

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
    const onClickOutside = (event: MouseEvent) => {
      if (InputRef.current &&
        DropdownRef.current &&
        !InputRef.current.contains(event.target as Node) &&
        !DropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof value === 'string') {
      setSelectedValue(undefined);
      setInputValue(value);
      return;
    }
    setSelectedValue(value as T);
    setInputValue('');
  }, [value, setSelectedValue, setInputValue]);

  return (<SelectInputWrapper>
    <InputWrapper className={leftIcon ? `${className} left-icon` : className}>
      {leftIcon && <Icon {...leftIcon}/>}
      {!selectedValue && !inputValue && placeholder && !isDropdownVisible && <Placeholder>{placeholder}</Placeholder>}
      {selectedValue && <div>
        {showOption(selectedValue)}
      </div>}
      <input
        type={'text'}
        value={inputValue}
        onChange={onInputChange}
        onFocus={onInputFocus}
        ref={InputRef}
      />
      {(inputValue || (isClearable && value)) && <ClearButton name={'circle-close'} size={16} onClick={onClear} />}
      <Icon name={'triangle'} size={8} />
    </InputWrapper>
    <Dropdown isOpen={isDropdownVisible} ref={DropdownRef}>
      {options.map((item, index) => (
        <OptionWrapper key={index} onClick={onOptionClick(item)} >{showOption(item)}</OptionWrapper>
      ))}
    </Dropdown>
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
    right: 0;
    bottom: 0;
    border: none;
    background: transparent;
    outline: none;
    padding: var(--gap);
  }
  & .icon-triangle{
    position: absolute;
    top: calc(50% - 4px);
    right: calc(var(--gap) / 2);
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
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  position: absolute;
  width: 100%;
  top: calc(100% + 4px);
  flex-direction: column;
  background: ${AdditionalLight};
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10;
`;

const OptionWrapper = styled.div`
  padding: var(--gap);
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
