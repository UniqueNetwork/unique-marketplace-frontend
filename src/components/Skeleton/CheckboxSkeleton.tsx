import React, { FCC } from 'react';
import styled from 'styled-components';

import Skeleton from './Skeleton';

const CheckboxSkeleton: FCC = () => {
  return (
    <CheckboxSkeletonWrapper>
      <Skeleton width={22} height={22}/>
      <Skeleton height={22}/>
    </CheckboxSkeletonWrapper>
  );
};

const CheckboxSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: var(--prop-gap);
`;

export default CheckboxSkeleton;
