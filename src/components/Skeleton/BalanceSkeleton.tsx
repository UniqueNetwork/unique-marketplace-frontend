import React, { FCC } from 'react';
import styled from 'styled-components';

import Skeleton from './Skeleton';

const BalanceSkeleton: FCC = () => {
  return (
    <AccountSkeletonWrapper>
      <BalanceSkeletonWrapper>
        <Skeleton height={24} width={50} />
        <Skeleton height={24} width={70} />
      </BalanceSkeletonWrapper>
      <Skeleton width={24} height={24} type={'circle'} />
    </AccountSkeletonWrapper>
  );
};

const AccountSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) * 2);
  padding: calc(var(--prop-gap) / 2) var(--prop-gap);
  min-width: 100px;
  div {
    padding: 0;
    min-width: 24px;
  }
`;

const BalanceSkeletonWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  row-gap: calc(var(--prop-gap) / 2);
  padding: calc(var(--prop-gap) / 2) var(--prop-gap);
  min-width: 100px;
  div {
    padding: 0;
    min-width: 24px;
  }
`;

export default BalanceSkeleton;
