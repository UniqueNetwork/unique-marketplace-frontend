import React, { FC } from 'react';
import styled from 'styled-components';

import Skeleton from './Skeleton';

const BalanceSkeleton: FC = () => {
  return (
    <BalanceSkeletonWrapper>
      <Skeleton width={24} height={24} type={'circle'} />
      <Skeleton height={24} />
      <Skeleton height={24} width={60} />
    </BalanceSkeletonWrapper>
  );
};

const BalanceSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  padding: calc(var(--gap) / 2) var(--gap);
  min-width: 100px;
  div {
    padding: 0;
    min-width: 24px;
  }
`;

export default BalanceSkeleton;
