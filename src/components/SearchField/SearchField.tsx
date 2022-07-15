import React, { FC, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Button, InputText } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { IconButton } from '../IconButton/IconButton';

interface SearchFieldProps {
  className?: string
  searchValue?: string | number
  placeholder?: string
  onSearch?(value: string | undefined): void
  onSearchStringChange?(value: string | undefined): void
  hideButton?: boolean
  testid?: string
}

const SearchField: FC<SearchFieldProps> = ({ className, searchValue, placeholder, onSearch, onSearchStringChange, hideButton, testid }) => {
  const [value, setValue] = useState<string | number | undefined>(searchValue);

  const onValueChange = useCallback((value: string | undefined) => {
    setValue(value);
    onSearchStringChange?.(value);
  }, [onSearchStringChange, setValue]);

  const onSearchInputKeyDown = useCallback((event: KeyboardEvent) => {
    if (!value) return;
    if (event.key !== 'Enter') return;
    onSearch?.(value.toString());
  }, [onSearch, value]);

  const onSearchClick = useCallback(() => {
    onSearch?.(value?.toString());
  }, [onSearch, value]);

  const onClear = useCallback(() => {
    setValue(undefined);
    onSearch?.(undefined);
    onSearchStringChange?.(undefined);
  }, [onSearch]);

  useEffect(() => {
    setValue(searchValue);
  }, [searchValue]);

  return (
    <SearchWrapper className={className}>
      <InputWrapper>
        <InputTextStyled
          iconLeft={{ name: 'magnify', size: 16 }}
          onChange={onValueChange}
          onKeyDown={onSearchInputKeyDown}
          placeholder={placeholder}
          value={value?.toString()}
          testid={`${testid}-input`}
        />

        {value &&
          <ClearButton
            name={'circle-close'}
            size={24}
            onClick={onClear}
            testid={`${testid}-clear-button`}
          />
        }
      </InputWrapper>
      {!hideButton && <Button
        onClick={onSearchClick}
        role='primary'
        title='Search'
        // @ts-ignore
        testid={`${testid}-search-button`}
      />}
    </SearchWrapper>
  );
};

export default SearchField;

const SearchWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  margin-right: 16px;
  button {
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    width: 100%;
    .unique-input-text {
      flex-grow: 1;
    }
  }

  @media (max-width: 320px) {
    margin-right: 0;
    .unique-button {
      display: none;
    }
  }
`;

const InputTextStyled = styled(InputText)`
  width: 100%;
  max-width: 610px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
  flex-grow: 1;
  max-width: 610px;
  flex-basis: 610px;
  .unique-input-text {
    width: auto;
    div.input-wrapper.with-icon.to-left > input {
      padding-right: 32px;
    }
  }
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: calc(var(--gap) / 2);
  bottom: 6px;
  width: auto !important;
`;
