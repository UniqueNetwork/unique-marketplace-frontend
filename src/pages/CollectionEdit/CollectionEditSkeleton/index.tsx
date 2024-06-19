import Skeleton from 'components/Skeleton/Skeleton';
import styled from 'styled-components';

export const CollectionEditSkeleton = () => <CollectionDetailSkeletonWrapper>
  <Skeleton width={160} height={160} type={'square'}/>
  <CardSkeletonWrapper>
    <Skeleton width={188} height={48} type={'square'}/>
    <Skeleton width={400} height={24} type={'square'}/>
    <Skeleton width={575} height={56} type={'square'}/>
  </CardSkeletonWrapper>
</CollectionDetailSkeletonWrapper>;

const CollectionDetailSkeletonWrapper = styled.div`
  display: flex;
  padding: calc(var(--prop-gap) * 2);
`;

const CardSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--prop-gap) / 4);
  margin-left: calc(var(--prop-gap) * 2);
  & > div:last-child {
    margin-top: 30px;
  }
`;
