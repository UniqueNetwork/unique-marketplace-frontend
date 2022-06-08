import React, { FC } from 'react';
import styled from 'styled-components';
import Skeleton from './Skeleton';

const CardSkeleton: FC = () => {
  return (
    <CardSkeletonWrapper>
      <Skeleton />
      <Skeleton height={26} />
      <Skeleton height={16} width={'75%'} />
    </CardSkeletonWrapper>
  );
};

const CardSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
  
  & > div {
    &::before {
      content: "";
      display: block;
      padding-top: 100%;
    }
  }
`;

export default CardSkeleton;
