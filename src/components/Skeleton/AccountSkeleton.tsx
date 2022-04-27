import React, { FC } from 'react';
import styled from 'styled-components/macro';

import Skeleton from './Skeleton';
import DoubleLineSkeleton from './DoubleLineSkeleton';

const AccountSkeleton: FC = () => {
  return (
    <AccountSkeletonWrapper>
      <Skeleton width={32} height={32} type={'circle'} />
      <DoubleLineSkeleton />
    </AccountSkeletonWrapper>
  );
};

const AccountSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  padding: calc(var(--gap) / 2) var(--gap);
  div {
    padding: 0;
  }
`;

export default AccountSkeleton;
