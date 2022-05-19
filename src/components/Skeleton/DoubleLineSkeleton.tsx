import React, { FC } from 'react';
import styled from 'styled-components/macro';

import Skeleton from './Skeleton';

const DoubleLineSkeleton: FC = () => {
  return (
    <DoubleLineSkeletonWrapper>
      <Skeleton height={22} width={60} />
      <Skeleton height={18} width={40} />
    </DoubleLineSkeletonWrapper>
  );
};

const DoubleLineSkeletonWrapper = styled.div`
  display: flex;
  row-gap: calc(var(--gap) / 2);
  flex-direction: column;
  padding: calc(var(--gap) / 2) var(--gap);
`;

export default DoubleLineSkeleton;
