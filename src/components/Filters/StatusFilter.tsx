import React, { FC, useCallback, useMemo } from 'react';
import { Checkbox } from 'components/UI';
import styled from 'styled-components';
import { Statuses } from './types';
import Accordion from '../Accordion/Accordion';
import { useAccounts } from '../../hooks/useAccounts';

interface StatusFilterProps {
  value: Statuses | undefined
  onChange(value: Statuses): void
  testid: string
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, testid }) => {
  const { myNFTs, myBets, fixedPrice, timedAuction } = value || {};
  const { selectedAccount } = useAccounts();

  const onMyNFTsChange = useCallback((value: boolean) => {
    onChange({ myNFTs: value, fixedPrice, timedAuction, myBets });
  }, [fixedPrice, timedAuction, myBets, onChange]);

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice: value, timedAuction, myBets });
  }, [myNFTs, timedAuction, myBets, onChange]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction: value, myBets: value ? myBets : value });
  }, [myNFTs, fixedPrice, myBets, onChange]);

  const onMyBetsChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction: value || timedAuction, myBets: value });
  }, [myNFTs, fixedPrice, timedAuction, onChange]);

  const onMethodClear = useCallback(() => {
    onChange({ myNFTs, fixedPrice: false, timedAuction: false, myBets });
  }, [onChange, myBets, myNFTs]);

  const onStatusClear = useCallback(() => {
    onChange({ myNFTs: false, fixedPrice, timedAuction, myBets: false });
  }, [onChange, fixedPrice, timedAuction]);

  const hideFixedPrice = useMemo(() => timedAuction, [timedAuction]);
  const hideTimedAuction = useMemo(() => fixedPrice, [fixedPrice]);
  const hideMyNFTs = useMemo(() => (timedAuction && myBets), [timedAuction, myBets]);
  const hideMyBets = useMemo(() => (fixedPrice || myNFTs), [fixedPrice, myNFTs]);

  return (
    <>
      <Accordion
        title={'Selling method'}
        isOpen={true}
        onClear={onMethodClear}
        testid={`${testid}-selling-method-accordion`}
      >
        <StatusFilterWrapper>
          {!hideFixedPrice && <Checkbox
            checked={!!fixedPrice}
            label={'Fixed price'}
            size={'m'}
            onChange={onFixedPriceChange}
            testid={`${testid}-fixedPrice-checkbox`}
          />}
          {!hideTimedAuction && <Checkbox
            checked={!!timedAuction}
            label={'Timed auction'}
            size={'m'}
            onChange={onTimedAuctionChange}
            testid={`${testid}-timedAuction-checkbox`}
          />}
        </StatusFilterWrapper>
      </Accordion>
      {selectedAccount && <Accordion
        title={'Status'}
        isOpen={true}
        onClear={onStatusClear}
        testid={`${testid}-status-accordion`}
      >
        <StatusFilterWrapper>
          {!hideMyNFTs && <Checkbox
            checked={!!myNFTs}
            label={'My NFTs on sale'}
            size={'m'}
            onChange={onMyNFTsChange}
            testid={`${testid}-myNft-checkbox`}
          />}
          {!hideMyBets && <Checkbox
            checked={!!myBets}
            label={'My bids'}
            size={'m'}
            onChange={onMyBetsChange}
            testid={`${testid}-myBids-checkbox`}
          />}
        </StatusFilterWrapper>
      </Accordion>}
    </>
  );
};

const StatusFilterWrapper = styled.div`
  padding-top: var(--gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

export default StatusFilter;
