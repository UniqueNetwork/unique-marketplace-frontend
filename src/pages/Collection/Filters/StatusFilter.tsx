import React, { FC, useCallback, useMemo } from 'react';
import { Accordion, Checkbox } from 'components/UI';
import styled from 'styled-components';
import { useAccounts } from 'hooks/useAccounts';
import { Statuses } from 'components/Filters/types';

interface StatusFilterProps {
  value: Statuses | undefined
  onChange(value: Statuses): void
  testid: string
  disabled?: boolean
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, testid, disabled }) => {
  const { fixedPrice } = value || {};
  const { selectedAccount } = useAccounts();

  const onOnSaleChange = useCallback((value: boolean) => {
    onChange({
      fixedPrice: value,
      myNFTs: undefined,
      timedAuction: undefined,
      myBets: undefined
    });
  }, [fixedPrice, onChange]);

  const onStatusClear = useCallback(() => {
    onChange({
      fixedPrice: false,
      myNFTs: undefined,
      timedAuction: undefined,
      myBets: undefined
    });
  }, [onChange, fixedPrice]);

  const hideMyNFTs = useMemo(() => false, []);

  return (
    <>
      {selectedAccount && <Accordion
        title={'Status'}
        isOpen={true}
        onClear={onStatusClear}
      >
        <StatusFilterWrapper>
          {!hideMyNFTs && <Checkbox
            checked={!!fixedPrice}
            label={'On sale'}
            size={'m'}
            onChange={onOnSaleChange}
            testid={`${testid}-myNft-checkbox`}
            disabled={disabled}
          />}
        </StatusFilterWrapper>
      </Accordion>}
    </>
  );
};

const StatusFilterWrapper = styled.div`
  padding-top: var(--prop-gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);
`;

export default StatusFilter;
