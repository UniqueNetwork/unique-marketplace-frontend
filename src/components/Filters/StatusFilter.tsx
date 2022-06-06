import React, { FC, useCallback } from 'react';
import { Checkbox } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Statuses } from './types';
import Accordion from '../Accordion/Accordion';

interface StatusFilterProps {
  value: Statuses | undefined
  onChange(value: Statuses): void
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange }) => {
  const { myNFTs, myBets, fixedPrice, timedAuction } = value || {};

  const onMyNFTsChange = useCallback((value: boolean) => {
    onChange({ myNFTs: value, fixedPrice, timedAuction, myBets });
  }, [fixedPrice, timedAuction, myBets, onChange]);

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice: value, timedAuction, myBets });
  }, [myNFTs, timedAuction, myBets, onChange]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction: value, myBets });
  }, [myNFTs, fixedPrice, myBets, onChange]);

  const onMyBetsChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction, myBets: value });
  }, [myNFTs, fixedPrice, timedAuction, onChange]);

  const onClear = useCallback(() => {
    onChange({ myNFTs: false, fixedPrice: false, timedAuction: false, myBets: false });
  }, [onChange]);

  return (
    <Accordion title={'Status'}
      isOpen={true}
      onClear={onClear}
      isClearShow={myNFTs || fixedPrice || timedAuction || myBets}
    >
      <StatusFilterWrapper>
        <Checkbox
          checked={!!myNFTs}
          label={'My NFTs on sale'}
          size={'m'}
          onChange={onMyNFTsChange}
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
          checked={!!myBets}
          label={'My bids'}
          size={'m'}
          onChange={onMyBetsChange}
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
