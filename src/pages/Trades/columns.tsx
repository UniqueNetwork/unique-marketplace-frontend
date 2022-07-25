import React, { useCallback } from 'react';
import { Icon, TableColumnProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { AddressComponent } from './AddressComponent/AddressComponent';
import { timestampTableFormat } from '../../utils/timestampUtils';
import { TokenComponent } from './TokenComponent/TokenComponent';
import { formatKusamaBalance } from '../../utils/textUtils';
import { BlueGrey600, Grey300 } from '../../styles/colors';
import config from '../../config';
import { TokenDescription, Trade } from '../../api/restApi/trades/types';
import { DeviceSize } from '../../hooks/useDeviceSize';

const tokenSymbol = 'KSM';

type ColumnProps = {
  deviceSize: DeviceSize
  onShowTradesDetailsModal: (trade: Trade) => void
}

const getTradesColumns = ({ deviceSize, onShowTradesDetailsModal }: ColumnProps): TableColumnProps[] => [
  {
    title: 'NFT',
    width: '11.84%',
    isSortable: true,
    render(tokenDescription: TokenDescription, { collectionId, tokenId }: Trade): React.ReactNode {
      return <TokenComponent {...{ collectionId, tokenId, tokenDescription }} />;
    },
    field: 'tokenDescription'
  },
  {
    title: 'Collection',
    width: '11.84%',
    isSortable: true,
    render(tokenDescription: TokenDescription, { collectionId }: Trade): React.ReactNode {
      const collectionName = tokenDescription.collectionName || '';
      return <LinkWrapper>
        <a
          target={'_blank'}
          rel={'noreferrer'}
          href={`${config?.scanUrl || ''}collections/${collectionId || ''}`}
          className={'unique-link primary'}
        >{`${deviceSize === DeviceSize.lg ? collectionName : `${collectionName.slice(0, 6)}...`} [ID ${collectionId || ''}]`}</a>
      </LinkWrapper>;
    },
    field: 'tokenDescription'
  },
  {
    title: 'Time',
    width: '11.84%',
    isSortable: true,
    render: (time: number) => <TimeCell><Text color={BlueGrey600}>{timestampTableFormat(new Date(time).valueOf())}</Text></TimeCell>,
    field: 'tradeDate'
  },
  {
    title: 'Price',
    width: '12.84%',
    isSortable: true,
    render: (value: string) => <Text color={BlueGrey600}>{`${formatKusamaBalance(value)} ${tokenSymbol}`}</Text>,
    field: 'price'
  },
  {
    title: (<HeaderCutted><span>Selling method</span></HeaderCutted>),
    width: '11.84%',
    render: (data: string) => <Text color={BlueGrey600}>{data === 'FixedPrice' ? 'Fixed price' : data}</Text>,
    isSortable: true,
    field: 'status'
  },
  {
    title: 'Seller',
      width: '17.52%',
    render: (data: string) => <AddressComponent text={data} />,
    field: 'seller'
  },
  {
    title: 'Buyer',
    width: '17.52%',
    render: (data: string) => <AddressComponent text={data} />,
    field: 'buyer'
  },
  {
    title: '',
    width: '5.74%',
    render: (data: string, row: Trade) => <ShowTradesDetailsButton status={data} trade={row} onShowTradesDetailsModal={onShowTradesDetailsModal} />,
    field: 'status'
  }
];

const ShowTradesDetailsButton = ({ status, trade, onShowTradesDetailsModal }: { status: string, trade: Trade, onShowTradesDetailsModal: (trade: Trade) => void }) => {
  const showTradesDetailsModal = useCallback(() => {
    onShowTradesDetailsModal(trade);
  }, [onShowTradesDetailsModal, trade]);

  return (
    <>{status === 'Auction' &&
      <StyledButton title={''} onClick={showTradesDetailsModal}>
        <Icon name={'carret-right'} size={16} />
      </StyledButton>
    }</>
  );
};

const LinkWrapper = styled.span`
  .unique-link {
    font-size: 16px;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
`;

const HeaderCutted = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledButton = styled.button`
  background: transparent;
  cursor: pointer;
  border: 1px solid ${Grey300};
  border-radius: 8px;
  padding: 8px;
  width: 32px;
  height: 32px;
`;

const TimeCell = styled.div`
  padding: 9px 0 !important;
`;

export default getTradesColumns;
