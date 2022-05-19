import React, { FC } from 'react';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import styled from 'styled-components';
import { MobileTableRow } from '../MobileTable/MobileTableRow';
import Skeleton from './Skeleton';

interface MobileTableSkeletonProps {
  columns: TableColumnProps[]
}

const MobileTableSkeleton: FC<MobileTableSkeletonProps> = ({ columns }) => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, indexRow) => <MobileTableRow key={`skeleton-row-${indexRow}`} >
        {columns.map((_, indexColumn) => <MobileTableSkeletonRowWrapper key={`skeleton-colimn-${indexColumn}`} >
          <Skeleton height={24} width={'50%'} />
          <Skeleton height={24} />
        </MobileTableSkeletonRowWrapper>)}
      </MobileTableRow>)}
    </>
  );
};

const MobileTableSkeletonRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
`;

export default MobileTableSkeleton;
