import React, { FC, useCallback } from 'react';
import { Checkbox } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { MyTokensStatuses } from './types';
import Accordion from '../../../components/Accordion/Accordion';

interface StatusFilterProps {
  value: MyTokensStatuses | undefined
  onChange(value: MyTokensStatuses): void
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange }) => {
  const { onSell, fixedPrice, timedAuction, notOnSale } = value || {};

  const onMyNFTsOnSellChange = useCallback((value: boolean) => {
    onChange({ onSell: value, fixedPrice, timedAuction, notOnSale });
  }, [fixedPrice, timedAuction, notOnSale, onChange]);

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ onSell, fixedPrice: value, timedAuction, notOnSale });
  }, [onSell, timedAuction, notOnSale, onChange]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ onSell, fixedPrice, timedAuction: value, notOnSale });
  }, [onSell, fixedPrice, notOnSale, onChange]);

  const onNotOnSaleChange = useCallback((value: boolean) => {
    onChange({ onSell, fixedPrice, timedAuction, notOnSale: value });
  }, [onSell, fixedPrice, timedAuction, onChange]);

  const onClear = useCallback(() => {
    onChange({ onSell: false, fixedPrice: false, timedAuction: false, notOnSale: false });
  }, [onChange]);

  return (
    <Accordion title={'Status'}
      isOpen={true}
      onClear={onClear}
      isClearShow={onSell || fixedPrice || timedAuction || notOnSale}
    >
      <StatusFilterWrapper>
        <Checkbox
          checked={!!onSell}
          label={'My NFTs on sale'}
          size={'m'}
          onChange={onMyNFTsOnSellChange}
        />
        <Checkbox
          checked={!!fixedPrice}
          label={'Fixed price'}
          size={'m'}
          onChange={onFixedPriceChange}
        />
        <Checkbox
          checked={!!timedAuction}
          label={'Timed auction'}
          size={'m'}
          onChange={onTimedAuctionChange}
        />
        <Checkbox
          checked={!!notOnSale}
          label={'Not on sale'}
          size={'m'}
          onChange={onNotOnSaleChange}
        />
      </StatusFilterWrapper>
    </Accordion>
  );
};

const StatusFilterWrapper = styled.div`
  padding-top: var(--gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

export default StatusFilter;
