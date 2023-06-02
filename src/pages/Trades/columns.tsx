import React, { useCallback } from 'react';
import { TableColumnProps, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Icon, Link } from 'components/UI';
import { AddressComponent } from './AddressComponent/AddressComponent';
import { timestampTableFormat } from '../../utils/timestampUtils';
import { TokenComponent } from './TokenComponent/TokenComponent';
import { formatBalance } from '../../utils/textUtils';
import { BlueGrey600, Grey300, Grey500, Secondary400 } from '../../styles/colors';
import { TokenDescription, Trade } from '../../api/restApi/trades/types';
import { DeviceSize } from '../../hooks/useDeviceSize';

type ColumnProps = {
  deviceSize: DeviceSize,
  onShowTradesDetailsModal: (trade: Trade) => void,
  scanUrl: string,
  testid: string,
  tokenSymbol: string
}

const getTradesColumns = ({ deviceSize, onShowTradesDetailsModal, scanUrl, testid, tokenSymbol }: ColumnProps): TableColumnProps[] => [
  {
    title: deviceSize !== DeviceSize.sm ? (<Header data-testid={`${testid}-header-nft`}>NFT</Header>) : null,
    width: deviceSize !== DeviceSize.md ? '14.3%' : '11.84%',
    isSortable: true,
    render(tokenId: number, { collectionId, tokenDescription }: Trade): React.ReactNode {
      return <TokenComponent testid={`${testid}-token`} {...{ collectionId, tokenId, tokenDescription }} />;
    },
    field: 'tokenId'
  },
  {
    title: (<Header data-testid={`${testid}-header-collection`}>Collection</Header>),
    width: deviceSize !== DeviceSize.md ? '14.3%' : '11.84%',
    isSortable: true,
    render(tokenDescription: TokenDescription, { collectionId, offerId }: Trade): React.ReactNode {
      const collectionName = tokenDescription.collectionName || '';
      return <LinkWrapper>
        <Link
          target={'_blank'}
          rel={'noreferrer'}
          href={`${scanUrl}collections/${collectionId || ''}`}
          className={'unique-link primary'}
          data-testid={`${testid}-${offerId}-collection`}
        >{`${deviceSize === DeviceSize.lg ? collectionName : `${collectionName.slice(0, 6)}...`} [ID\xa0${collectionId || ''}]`}</Link>
      </LinkWrapper>;
    },
    field: 'tokenDescription'
  },
  {
    title: (<Header data-testid={`${testid}-header-time`}>Time</Header>),
    width: deviceSize !== DeviceSize.md ? '14.3%' : '11.84%',
    isSortable: true,
    render: (time: number, { offerId }: Trade) => <TimeCell><Text testid={`${testid}-${offerId}-time`} color={BlueGrey600}>{timestampTableFormat(new Date(time).valueOf())}</Text></TimeCell>,
    field: 'tradeDate'
  },
  {
    title: (<Header data-testid={`${testid}-header-price`}>Price</Header>),
    width: deviceSize !== DeviceSize.md ? '14.3%' : '11.84%',
    isSortable: true,
    render: (value: string, { offerId }: Trade) => <Text testid={`${testid}-${offerId}-price`} color={BlueGrey600}>{`${formatBalance(value)} ${tokenSymbol}`}</Text>,
    field: 'price.parsed'
  },
  {
    title: (<Header data-testid={`${testid}-header-seller`}>Seller</Header>),
    width: deviceSize !== DeviceSize.md ? '14.3%' : '17.52%',
    render: (data: string) => <AddressComponent testid={`${testid}-seller`} text={data} />,
    field: 'seller'
  },
  {
    title: (<Header data-testid={`${testid}-header-buyer`}>Buyer</Header>),
    width: deviceSize !== DeviceSize.md ? '14.3%' : '17.52%',
    render: (data: string) => <AddressComponent testid={`${testid}-buyer`} text={data} />,
    field: 'buyer'
  },
  {
    title: '',
    width: '56px',
    render: (data, row: Trade) => <ShowTradesDetailsButton
      status={row.status}
      trade={row}
      onShowTradesDetailsModal={onShowTradesDetailsModal}
      testid={testid}
    />,
    field: 'modalButton'
  }
];

const ShowTradesDetailsButton = ({ status, trade, onShowTradesDetailsModal, testid }: { status: string, trade: Trade, onShowTradesDetailsModal: (trade: Trade) => void, testid: string }) => {
  const showTradesDetailsModal = useCallback(() => {
    onShowTradesDetailsModal(trade);
  }, [onShowTradesDetailsModal, trade]);

  return (
    <>{status === 'Auction' &&
      <StyledButton title={''} onClick={showTradesDetailsModal} data-testid={`${testid}-details-button-C${trade.collectionId}-T${trade.tokenId}`}>
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

const Header = styled.span`
  font-size: 16px;
  line-height: 24px;
  color: ${Grey500};
  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

const HeaderCutted = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  span {
    font-size: 16px;
    line-height: 24px;
    color: ${Grey500};
  }
  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

const StyledButton = styled.button`
  background: transparent;
  cursor: pointer;
  border: 1px solid ${Grey300};
  border-radius: 8px;
  padding: 8px;
  width: 32px;
  height: 32px;
  svg {
    fill: ${Secondary400};
  }
  @media (max-width: 768px) {
    position: absolute;
    top: var(--gap);
    right: 0;
  }
`;

const TimeCell = styled.div`
  //padding: 9px 0 !important;
`;

export default getTradesColumns;
