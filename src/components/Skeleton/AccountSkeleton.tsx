import React, { FC } from 'react';
import styled from 'styled-components';

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
  column-gap: calc(var(--prop-gap) / 2);
  padding: calc(var(--prop-gap) / 2) var(--prop-gap);
  div {
    padding: 0;
  }
`;

export default AccountSkeleton;
