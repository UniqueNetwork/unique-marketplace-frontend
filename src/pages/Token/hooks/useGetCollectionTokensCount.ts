import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useEffect, useState } from 'react';
import config from '../../../config';

const gqlQuery = {
  operationName: 'tokens_count_by_collection_id',
  query: `query tokens_count_by_collection_id(
    $collectionId: Float!
  ) {
    collections (
      where: {
        collection_id: {_eq: $collectionId}
      }
    ) {
      data {
        tokens_count
      }
    }
  }
  `
};

export type AttributeStatistic = {
  key: string
  name: { _: string }
  values: {
    tokens_count: number
    raw_value: string
    value: { _: string }
  }[]
}

export const useGetCollectionTokensCount = (collectionId: number) => {
  const { settings, currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [tokensCount, setTokensCount] = useState<number>(0);

  useEffect(() => {
    void (async () => {
      setIsFetching(true);

      const { scanApi } = config.blockchains[currentChainId || ''] || {};
      const response = await post(scanApi, {
        ...gqlQuery,
        variables: {
          collectionId
        }
      });
      if (response.status === 200) {
        const count = response?.data?.data?.collections?.data?.[0]?.tokens_count || 0;
        setTokensCount(count);
        setIsFetching(false);
      }
      setIsFetching(false);
    })();
  }, [settings, chainProperties?.SS58Prefix, collectionId]);

  return {
    isFetching,
    tokensCount
  };
};
