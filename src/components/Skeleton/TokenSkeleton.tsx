import React, { FC } from 'react';
import styled from 'styled-components';

import Skeleton from './Skeleton';
import AccountSkeleton from './AccountSkeleton';
import { Grey300 } from '../../styles/colors';

export const TokenSkeleton: FC = () => {
  return <TokenSkeletonWrapper>
    <Skeleton height={48} />
    <Skeleton height={24} width={100} />
    <Skeleton height={24} width={'70%'} />
    <Divider />
    <Skeleton height={24} width={100} />
    <Skeleton height={48} width={'50%'}/>
    <Skeleton height={24} width={70} />
    <Skeleton height={24} width={80} />
    <Divider />
    <Skeleton height={28} />
    <Skeleton height={24} width={100} />
    <Skeleton height={24}/>
    <Divider />
    <AccountSkeleton />
  </TokenSkeletonWrapper>;
};

const TokenSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  div:first-child {
    margin-bottom: calc(var(--gap) / 2);
  }
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
