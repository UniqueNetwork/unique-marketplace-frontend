import React, { FC, useCallback, useMemo } from 'react';
import { Checkbox } from 'components/UI';
import styled from 'styled-components';
import { Statuses } from './types';
import { Accordion } from '../Accordion/Accordion';
import { useAccounts } from '../../hooks/useAccounts';

interface StatusFilterProps {
  value: Statuses | undefined
  onChange(value: Statuses): void
  testid: string
  disabled?: boolean
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, testid, disabled }) => {
  const { myNFTs, myBets, fixedPrice, timedAuction } = value || {};
  const { selectedAccount } = useAccounts();

  const onMyNFTsChange = useCallback((value: boolean) => {
    onChange({ myNFTs: value, fixedPrice, timedAuction, myBets });
  }, [fixedPrice, timedAuction, myBets, onChange]);

  const onStatusClear = useCallback(() => {
    onChange({ myNFTs: false, fixedPrice, timedAuction, myBets: false });
  }, [onChange, fixedPrice, timedAuction]);

  const hideMyNFTs = useMemo(() => (timedAuction && myBets), [timedAuction, myBets]);

  return (
    <>
      {selectedAccount && <Accordion
        title={'Status'}
        isOpen={true}
        onClear={onStatusClear}
      >
        <StatusFilterWrapper>
          {!hideMyNFTs && <Checkbox
            checked={!!myNFTs}
            label={'My NFTs on sale'}
            size={'m'}
            onChange={onMyNFTsChange}
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
