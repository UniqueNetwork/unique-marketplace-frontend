import React from 'react';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { AddressComponent } from './AddressComponent/AddressComponent';
import { timestampTableFormat } from '../../utils/timestampUtils';
import { TokenComponent } from './TokenComponent/TokenComponent';
import { formatKusamaBalance } from '../../utils/textUtils';
import { BlueGrey600 } from '../../styles/colors';
import config from '../../config';
import { TokenDescription, Trade } from '../../api/restApi/trades/types';

const tokenSymbol = 'KSM';

export const tradesColumns: TableColumnProps[] = [
  {
    title: 'NFT',
    width: '100%',
    isSortable: true,
    render(tokenDescription: TokenDescription, { collectionId, tokenId }: Trade): React.ReactNode {
      return <TokenComponent {...{ collectionId, tokenId, tokenDescription }} />;
    },
    field: 'tokenDescription'
  },
  {
    title: 'Collection',
    width: '100%',
    isSortable: true,
    render(tokenDescription: TokenDescription, { collectionId }: Trade): React.ReactNode {
      return <LinkWrapper>
        <a
          target={'_blank'}
          rel={'noreferrer'}
          href={`${config?.scanUrl || ''}collections/${collectionId || ''}`}
          className={'unique-link primary'}
        >{`${tokenDescription.collectionName || ''} [ID ${collectionId || ''}]`}</a>
      </LinkWrapper>;
    },
    field: 'tokenDescription'
  },
  {
    title: 'Time',
    width: '100%',
    isSortable: true,
    render: (time: number) => <Text color={BlueGrey600}>{timestampTableFormat(new Date(time).valueOf())}</Text>,
    field: 'tradeDate'
  },
  {
    title: 'Price',
    width: '100%',
    isSortable: true,
    render: (value: string) => <Text color={BlueGrey600}>{`${formatKusamaBalance(value)} ${tokenSymbol}`}</Text>,
    field: 'price'
  },
  {
    title: 'Buyer',
    width: '100%',
    render: (data: string) => <AddressComponent text={data} />,
    field: 'buyer'
  },
  {
    title: 'Seller',
      width: '100%',
    render: (data: string) => <AddressComponent text={data} />,
    field: 'seller'
  }
];

const LinkWrapper = styled.span`
  .unique-link {
    font-size: 16px;
  }
`;
