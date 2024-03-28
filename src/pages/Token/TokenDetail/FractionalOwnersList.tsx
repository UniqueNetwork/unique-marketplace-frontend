import { useCallback, useContext, useEffect, useState } from 'react';

import { Heading, Pagination, Text } from 'components/UI';
import { ProgressBar } from 'components';
import { OwnerCard } from 'components/OwnerCard/OwnerCard';
import { Table } from 'components/Table';
import { useApi } from 'hooks/useApi';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import styled from 'styled-components';
import { percentText } from 'utils/textUtils';
import { TokenContext } from '../context/TokenContext';
import { useGetRFTOwners } from '../hooks/useGetRFTOwners';
import { TableColumnProps, TableRowProps } from 'components/UI/Table/Table';

const pageSize = 20;

type ColumnsProps = {
  currentChainId: string
  collectionId: number
  tokenId: number
  totalPieces: number
  deviceSize: DeviceSize
}

const getColumns = ({ currentChainId, collectionId, tokenId, totalPieces, deviceSize }: ColumnsProps): TableColumnProps[] => [
  {
    title: 'Faction owner',
    width: '50%',
    isSortable: false,
    render(address: string): React.ReactNode {
      return <OwnerCard
        address={address}
        canCopy={false}
        to={`/${currentChainId}/token/${address}/${collectionId}/${tokenId}`}
        isShort={deviceSize <= DeviceSize.xl}
        prefixNested={'Nested in'}
      />;
    },
    field: 'owner'
  },
  {
    title: 'Owned fractions',
    width: '25%',
    isSortable: false,
    render(amount: number): React.ReactNode {
      return <Text >{amount} / {totalPieces}</Text>;
    },
    field: 'amount'
  },
  {
    title: 'Ownership percentage',
    width: '25%',
    isSortable: false,
    render(amount: number): React.ReactNode {
      const percent = (amount / totalPieces) * 100;
      return <Row>
        <ProgressBar filledPercent={percent} height={14} />
        <Text size='s' color='grey-500'>{percentText(percent)}</Text>
      </Row>;
    },
    field: 'amount'
  }
];

export const FractionalOwnersList = () => {
  const { currentChainId } = useApi();
  const { fraction, token } = useContext(TokenContext);
  const deviceSize = useDeviceSize();

  const { fetchOwners, isFetching, owners, totalOwners } = useGetRFTOwners();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!token) return;
    void fetchOwners(token?.collectionId, token.tokenId, pageSize, 0);
  }, [fetchOwners, token]);

  const onPageChange = useCallback((newPage: number) => {
    if (!token) return;
    setPage(newPage);
    void fetchOwners(token.collectionId, token.tokenId, pageSize, newPage);
  }, [token]);

  if (!token || !currentChainId) return null;

  const { collectionId, tokenId } = token || {};
  return <>
    <Heading size='4' >Owners</Heading>
    <Table
      data={owners as TableRowProps[]}
      columns={getColumns({
        collectionId,
        tokenId,
        currentChainId,
        totalPieces: fraction?.totalPieces || 0,
        deviceSize
      })}
      idColumnName={'offerId'}
      loading={isFetching}
    />
    {(!!totalOwners) && <PaginationWrapper>
      <Pagination
        current={page}
        size={totalOwners}
        onPageChange={onPageChange}
        withIcons
      />
    </PaginationWrapper>}
  </>;
};

const PaginationWrapper = styled.div`
  margin-top: calc(var(--prop-gap) * 2);
  
  .unique-pagination-wrapper {
    justify-content: space-between;
  }
  
  @media (max-width: 568px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) / 2);
  align-items: center;
  && span {
    min-width: 30%;
  }
`;
