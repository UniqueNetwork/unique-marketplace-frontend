import React, { FC, useCallback } from 'react';
import { RadioGroup } from 'components/UI';
import styled from 'styled-components';
import { useAccounts } from 'hooks/useAccounts';
import { RadioOptionValueType } from 'components/UI/RadioGroup/RadioGroup';
import { BelongingValue } from './types';

interface BelongingFilterProps {
  value: BelongingValue | undefined
  onChange(value: BelongingValue): void
  disabled?: boolean
}

const BelongingFilter: FC<BelongingFilterProps> = ({ value, onChange, disabled }) => {
  const { selectedAccount } = useAccounts();

  const onChangeFilter = useCallback((value: RadioOptionValueType) => {
    onChange(value.value as BelongingValue);
  }, [onChange]);

  if (!selectedAccount) return null;

  return (
    <>
      <BelongingFilterWrapper>
        <RadioGroup
          options={[
            {
              value: 'All',
              label: 'All',
              disabled
            },
            {
              value: 'Owned',
              label: 'Owned',
              disabled
            },
            {
              value: 'Disowned',
              label: 'Disowned',
              disabled
            }
          ]}
          onChange={onChangeFilter}
          value={value || 'All'}
        />
      </BelongingFilterWrapper>
    </>
  );
};

const BelongingFilterWrapper = styled.div`
  padding-top: var(--gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

export default BelongingFilter;
