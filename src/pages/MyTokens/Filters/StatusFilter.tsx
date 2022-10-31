import React, { FC, useCallback, useMemo } from 'react';
import { Checkbox } from 'components/UI';
import styled from 'styled-components';
import { MyTokensStatuses } from './types';
import Accordion from '../../../components/Accordion/Accordion';
import { useAccounts } from '../../../hooks/useAccounts';

interface StatusFilterProps {
  value: MyTokensStatuses | undefined
  onChange(value: MyTokensStatuses): void
  testid: string
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, testid }) => {
  const { onSell, fixedPrice, timedAuction, notOnSale } = value || {};
  const { selectedAccount } = useAccounts();

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ onSell: value || onSell, fixedPrice: value, timedAuction, notOnSale: false });
  }, [timedAuction, onSell, onChange]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ onSell: value || onSell, fixedPrice, timedAuction: value, notOnSale: false });
  }, [onSell, fixedPrice, onChange]);

  const onMyNFTsOnSellChange = useCallback((value: boolean) => {
    onChange({ onSell: value, fixedPrice: false, timedAuction: false, notOnSale: false });
  }, [fixedPrice, timedAuction, notOnSale, onChange]);

  const onNotOnSaleChange = useCallback((value: boolean) => {
    onChange({ onSell: false, fixedPrice: false, timedAuction: false, notOnSale: value });
  }, [onChange]);

  const onMethodClear = useCallback(() => {
    onChange({ onSell, fixedPrice: false, timedAuction: false, notOnSale });
  }, [onChange, onSell, notOnSale]);

  const onStatusClear = useCallback(() => {
    onChange({ onSell: false, fixedPrice, timedAuction, notOnSale: false });
  }, [onChange, fixedPrice, timedAuction]);

  const hideFixedPrice = useMemo(() => (timedAuction), [timedAuction]);
  const hideTimedAuction = useMemo(() => (fixedPrice), [fixedPrice]);
  const hideOnSale = useMemo(() => (notOnSale), [notOnSale]);
  const hideNotOnSale = useMemo(() => (fixedPrice || timedAuction || onSell), [fixedPrice, timedAuction, onSell]);

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
          {!hideOnSale && <Checkbox
            checked={!!onSell}
            label={'On sale'}
            size={'m'}
            onChange={onMyNFTsOnSellChange}
            testid={`${testid}-myNft-checkbox`}
          />}
          {!hideNotOnSale && <Checkbox
            checked={!!notOnSale}
            label={'Not on sale'}
            size={'m'}
            onChange={onNotOnSaleChange}
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
