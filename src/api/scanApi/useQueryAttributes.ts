import { post } from 'api/restApi/base';
import config from 'config';
import { useApi } from 'hooks/useApi';
import { useEffect, useState } from 'react';

const gqlQuery = {
  operationName: 'attributes_by_collection_id',
  query: `query attributes_by_collection_id(
    $collectionId: Float!
  ) {
    attributes(
      where: {collection_id: {_eq: $collectionId} }
    ) {
      count
      data {
        trait_type
        collection_id
        display_type
        token_id
        value_number
        value_string
      }
    }
  }`
};

export type AttributeStatisticV1 = {
  name: { _: string };
  values: {
    tokens_count: number;
    raw_value: string;
    value: { _: string };
  }[];
};

export type AttributeStatistic = {
  collection_id: number;
  display_type: string;
  token_id: number;
  trait_type: string;
  value_number: number;
  value_string: string;
};

export const useQueryAttributes = (collectionId: number) => {
  const { settings, currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [attributes, setAttributes] = useState<AttributeStatistic[]>([]);

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
        const attributes = response?.data?.data?.attributes?.data as AttributeStatistic[] || [];
        setAttributes(attributes);
        setIsFetching(false);
      }
      setIsFetching(false);
    })();
  }, [settings, chainProperties?.SS58Prefix, collectionId]);

  return {
    isFetching,
    attributes
  };
};
