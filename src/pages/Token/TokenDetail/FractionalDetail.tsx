import React, { FCC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Heading, Text } from 'components/UI';
import { ProgressBar } from 'components';
import { useApi } from '../../../hooks/useApi';
import { formatLongNumber, percentText } from 'utils/textUtils';
import Skeleton from 'components/Skeleton/Skeleton';

interface FractionalDetailProps {
  testid?: string
}

export const FractionalDetail: FCC<FractionalDetailProps> = () => {
  const { address, id, collectionId } = useParams<{ address: string, id: string, collectionId: string}>();
  const { api } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [pieces, setPieces] = useState<number>(0);

  useEffect(() => {
    if (!api?.rft || !address || !collectionId || !id) return;
    setIsFetching(true);
    void (async () => {
      const balanceResponse = await api?.rft?.getTokenBalance(Number(collectionId), Number(id), address);
      const piecesResponse = await api?.rft?.getTokenTotalPieces(Number(collectionId), Number(id));
      setBalance(balanceResponse?.amount || 0);
      setPieces(piecesResponse?.amount || 0);
      setIsFetching(false);
    })();
  }, [address, id, collectionId, api?.rft]);

  const percent = useMemo(() => {
    return ((balance || 0) / (pieces || 1)) * 100;
  }, [balance, pieces]);

  if (!address || !collectionId || !id) return null;

  if (isFetching) {
    return <FractionalDetailWrapper>
      <Heading className='header' size='4'>
        Characteristics
      </Heading>
      <Skeleton height={'24px'} width={'100%'} />
      <Skeleton height={'24px'} width={'60%'} />
      <Skeleton height={'24px'} width={'80%'} />
      <Skeleton height={'24px'} width={'100%'} />
    </FractionalDetailWrapper>;
  }

  return (
    <FractionalDetailWrapper>
      <Heading className='header' size='4'>
        Characteristics
      </Heading>
      <Row>
        <Text size='m' weight='light' color='grey-500'>
          Total minted fractions:
        </Text>
        <Text>{formatLongNumber(pieces || 0)}</Text>
      </Row>
      <Row>
        <Text size='m' weight='light' color='grey-500'>
          Owned fractions:
        </Text>
        <Text>{formatLongNumber(balance || 0)}</Text>
      </Row>
      <Row>
        <Text size='m' weight='light' color='grey-500'>
          Ownership percentage:
        </Text>
        <Text>{percentText(percent)}</Text>
      </Row>
      <Row>
        <ProgressBar filledPercent={percent} height={14} />
      </Row>
    </FractionalDetailWrapper>
  );
};

const FractionalDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: calc(var(--prop-gap) / 2);
  gap: calc(var(--prop-gap) / 4);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) / 2);
  && h1 {
    margin-bottom: 0;
  }
`;
