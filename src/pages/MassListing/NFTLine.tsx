import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';
import { Text } from 'components/UI';
import { NewToken2 } from 'pages/CreateNFT/types';
import { CurrencySelect } from './components/CurrencySelect';

export type TokenWithPrice = NewToken2 & { price: number; collectionId: number; currency: number };

type NFTLineProps = {
  token: TokenWithPrice;
  isSelected: boolean;
  onSelect: (tokenId: number) => void;
  onPriceChange: (tokenId: number, collectionId: number, newPrice: number) => void;
  onCurrencyChange: (tokenId: number, collectionId: number, currency: number) => void;
};

export const NFTLine = React.memo(
  ({ token, isSelected, onSelect, onPriceChange, onCurrencyChange }: NFTLineProps) => {
    const [priceInput, setPriceInput] = useState(token.price > 0 ? token.price.toString() : '');
    useEffect(() => {
      setPriceInput(token.price > 0 ? token.price.toString() : '');
    }, [token.price]);

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      
      const sanitized = value.replace(/[^\d.]/g, '');

      const parts = sanitized.split('.');
      if (parts.length > 2) {
        return;
      }
      
      setPriceInput(sanitized);

      const numValue = sanitized === '' || sanitized === '.' ? 0 : parseFloat(sanitized) || 0;
      onPriceChange(token.id, token.collectionId, numValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        !/[0-9]/.test(event.key) &&
        event.key !== 'Backspace' &&
        event.key !== 'Delete' &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Tab' &&
        event.key !== '.'
      ) {
        event.preventDefault();
      }
      
      if (event.key === '.' && event.currentTarget.value.includes('.')) {
        event.preventDefault();
      }
    };

    return (
      <TokenLineWrap>
        <TokenLineCell>
          <Checkbox checked={isSelected} onChange={() => onSelect(token.id)} label={''} testid={''} />
        </TokenLineCell>
        <TokenLineCell>
          <Text>{`NFT #${token.tokenId} - ${token.collectionId}`}</Text>
        </TokenLineCell>
        <TokenLineCell>
          <TokenImage src={token.image?.url} alt={`NFT #${token.tokenId}`} />
        </TokenLineCell>
        <TokenLineCell>
          <PriceInput
            type="text"
            value={priceInput}
            onChange={handlePriceChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter price"
          />
        </TokenLineCell>
        <TokenLineCell>
          <CurrencySelect
            onCurrencyChange={(currency) => onCurrencyChange(token.id, token.collectionId, currency)}
            tokenId={token.id}
            selectedCurrency={token.currency}
          />
        </TokenLineCell>
      </TokenLineWrap>
    );
  },
);

const TokenLineWrap = styled.div`
  display: flex;
  width: 1200px;
  height: 240px;

  &:last-child {
    border-bottom: 1px solid var(--color-table-grey);
  }
`;

export const TokenLineCell = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--color-table-grey);
  border-top: 1px solid var(--color-table-grey);
  height: 100%;
  padding: 18px 0;
  box-sizing: border-box;
  &:first-child {
    flex: 0.5;
    border-left: 1px solid #b9b9b9;
  }
`;

const TokenImage = styled.img`
  width: 230px;
  height: 230px;
  object-fit: cover;
  border-radius: 4px;
`;

const PriceInput = styled.input`
  font-size: 20px;
  flex: 1;
  border: none;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  resize: none;
  padding: 10px;
  font-family: var(--font-inter);
  background: transparent;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;

  &:focus {
    outline: none;
  }
`;