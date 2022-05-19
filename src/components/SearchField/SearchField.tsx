import React, { FC, KeyboardEvent, useCallback } from 'react';
import { Button, InputText } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { IconButton } from '../IconButton/IconButton';

interface SearchFieldProps {
  className?: string
  searchValue?: string | number
  placeholder?: string
  onSearchStringChange(value: string): void
  onSearchInputKeyDown(event: KeyboardEvent): void
  onSearch(): void
}

const SearchField: FC<SearchFieldProps> = ({ className, searchValue, placeholder, onSearchStringChange, onSearchInputKeyDown, onSearch }) => {
  const onClear = useCallback(() => {
    onSearchStringChange('');
    onSearch();
  }, []);

  return (
    <SearchWrapper className={className}>
      <InputWrapper>
        <InputTextStyled
          iconLeft={{ name: 'magnify', size: 16 }}
          onChange={onSearchStringChange}
          onKeyDown={onSearchInputKeyDown}
          placeholder={placeholder}
          value={searchValue?.toString()}
        />

        {searchValue && <ClearButton name={'close'} size={16} onClick={onClear} />}
      </InputWrapper>
      <Button
        onClick={onSearch}
        role='primary'
        title='Search'
      />
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
    input {
      padding-right: 22px;
    }
  }
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: calc(var(--gap) / 2);
  top: 50%;
  margin-top: -8px;
  width: auto !important;
`;
