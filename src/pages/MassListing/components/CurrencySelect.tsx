import React, { useEffect, useState } from 'react';
import { Select } from 'components/UI';
import ComingSoon from 'pages/Token/TokenDetail/CurrencesComingSoon';
import styled from 'styled-components';
import { useApi } from 'hooks/useApi';
import { SelectOptionProps } from 'components/UI/types'; // Ensure this import is correct

type CurrencySelectProps = {
  onCurrencyChange: (currency: number) => void;
  tokenId: number;
  selectedCurrency: number;
};

export const CurrencySelect = React.memo(({ onCurrencyChange, tokenId, selectedCurrency }: CurrencySelectProps) => {
  const { currencies, currencyMap } = useApi();
  const [selectedCurrencyOption, setSelectedCurrencyOption] = useState(currencyMap.get(String(selectedCurrency)));

  useEffect(() => {
    setSelectedCurrencyOption(currencyMap.get(String(selectedCurrency)));
  }, [currencyMap, selectedCurrency]);

  const handleCurrencyChange = (option: SelectOptionProps | SelectOptionProps[]) => {
    const selectedOption = Array.isArray(option) ? option[0] : option;
    const currency = Number(selectedOption.id);
    setSelectedCurrencyOption(currencyMap.get(String(currency)));
    onCurrencyChange(currency);
  };

  return (
    <SelectWrapper
      onChange={handleCurrencyChange}
      options={currencies.map((option) => ({
        id: option.id,
        title: option.title,
        iconLeft: { size: 20, file: option.iconUrl },
      }))}
      value={selectedCurrencyOption?.id || '0'}
      testid={`mass-listion-table-row-${tokenId}`}
      label={''}
    >
      {currencies.length <= 1 && <ComingSoon />}
    </SelectWrapper>
  );
});

const SelectWrapper = styled(Select)`
  width: 80%;
  margin: 8px 0 0 0 !important;
`;