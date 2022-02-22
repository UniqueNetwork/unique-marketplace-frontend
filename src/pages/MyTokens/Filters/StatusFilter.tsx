import React, { FC, useCallback, useState } from 'react';
import { Checkbox } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { MyTokensStatuses } from './types';

interface StatusFilterProps {
  onChange(value: MyTokensStatuses): void
}

const StatusFilter: FC<StatusFilterProps> = ({ onChange }) => {
  const [myNFTs, setMyNFTs] = useState<boolean>(false);
  const [fixedPrice, setFixedPrice] = useState<boolean>(false);
  const [timedAuction, setTimedAuction] = useState<boolean>(false);
  const [notOnSale, setNotOnSale] = useState<boolean>(false);

  const onMyNFTsChange = useCallback((value: boolean) => {
    onChange({ myNFTs: value, fixedPrice, timedAuction, notOnSale });
    setMyNFTs(value);
  }, [fixedPrice, timedAuction, notOnSale]);

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice: value, timedAuction, notOnSale });
    setFixedPrice(value);
  }, [myNFTs, timedAuction, notOnSale]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction: value, notOnSale });
    setTimedAuction(value);
  }, [myNFTs, fixedPrice, notOnSale]);

  const onNotOnSaleChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction, notOnSale: value });
    setNotOnSale(value);
  }, [myNFTs, fixedPrice, timedAuction]);

  return (
    <StatusFilterWrapper>
      <Checkbox
        checked={myNFTs}
        label={'My NFTs on sell'}
        size={'m'}
        onChange={onMyNFTsChange}
      />
      <Checkbox
        checked={fixedPrice}
        label={'Fixed price'}
        size={'m'}
        onChange={onFixedPriceChange}
      />
      <Checkbox
        checked={timedAuction}
        label={'Timed auction'}
        size={'m'}
        onChange={onTimedAuctionChange}
      />
      <Checkbox
        checked={notOnSale}
        label={'Not on sale'}
        size={'m'}
        onChange={onNotOnSaleChange}
      />
    </StatusFilterWrapper>
  );
};

const StatusFilterWrapper = styled.div`
  padding-top: var(--gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

export default StatusFilter;
