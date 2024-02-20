import { Account } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useState } from 'react';
import { CollectionItem } from '../types';
import config from '../../../config';
import { Address } from '@unique-nft/utils';

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
        key
        name
        values {
          tokens_count
          raw_value
          value
        }
      }
    }
  }`
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

export const useAttributes = (collectionId: number) => {
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
