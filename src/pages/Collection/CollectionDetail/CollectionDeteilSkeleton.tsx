import Skeleton from 'components/Skeleton/Skeleton';
import styled from 'styled-components';

export const CollectionDetailSkeleton = () => <CollectionDetailSkeletonWrapper>
  <Skeleton width={160} height={160} type={'circle'}/>
  <CardSkeletonWrapper>
    <Skeleton width={188} height={48} type={'square'}/>
    <Skeleton width={400} height={24} type={'square'}/>
    <Skeleton width={575} height={56} type={'square'}/>
  </CardSkeletonWrapper>
</CollectionDetailSkeletonWrapper>;

const CollectionDetailSkeletonWrapper = styled.div`
  display: flex;
`;

const CardSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
  margin-left: calc(var(--gap) * 2);
  & > div:last-child {
    margin-top: 30px;
  }
`;
