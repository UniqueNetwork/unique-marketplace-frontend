import { post } from 'api/restApi/base';
import config from 'config';
import { useApi } from 'hooks/useApi';
import { useEffect, useState } from 'react';

const gqlQueryV1 = {
  operationName: 'attributes_v1_by_collection_id',
  query: `query attributes_v1_by_collection_id($collectionId: Float!) {
    attributes_v1(
      where: {collection_id: {_eq: $collectionId}}
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

const gqlQueryV2 = {
  operationName: 'attributes_by_collection_id',
  query: `query attributes_by_collection_id(
    $collectionId: Float!
    $limit: Int
    $offset: Int
  ) {
    attributes(
      where: {collection_id: {_eq: $collectionId}}
      limit: $limit
      offset: $offset
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
  key: string;
  name: { _: string };
  values: {
    tokens_count: number;
    raw_value: string;
    value: { _: string };
  }[];
};

export type AttributeStatisticV2 = {
  trait_type: string;
  value_string: string;
  count: number;
};

export type AttributeStatistic = AttributeStatisticV1 | AttributeStatisticV2;

export const useQueryAttributes = (collectionId: number) => {
  const { settings, currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [attributes, setAttributes] = useState<AttributeStatistic[]>([]);

  useEffect(() => {
    void (async () => {
      setIsFetching(true);

      const { scanApi } = config.blockchains[currentChainId || ''] || {};
      
      try {
        // Step 1: Try attributes_v1 (fast method with pre-aggregated data)
        const responseV1 = await post(scanApi, {
          ...gqlQueryV1,
          variables: { collectionId }
        });

        if (responseV1.status === 200) {
          const countV1 = responseV1?.data?.data?.attributes_v1?.count || 0;
          
          if (countV1 > 0) {
            // If attributes_v1 has data, use it (already aggregated correctly)
            const attributesV1 = responseV1?.data?.data?.attributes_v1?.data as AttributeStatisticV1[] || [];
            console.log('Using attributes_v1:', attributesV1.length, 'items');
            setAttributes(attributesV1);
            setIsFetching(false);
            return;
          }
        }

        // Step 2: If attributes_v1 is empty, use attributes with pagination
        console.log('attributes_v1 returned 0, switching to attributes with pagination');
        
        const initialResponse = await post(scanApi, {
          ...gqlQueryV2,
          variables: {
            collectionId,
            limit: 1,
            offset: 0
          }
        });

        if (initialResponse.status !== 200) {
          console.error('API request failed with status:', initialResponse.status);
          setIsFetching(false);
          return;
        }

        const totalCount = initialResponse?.data?.data?.attributes?.count || 0;
        console.log('Total attributes count:', totalCount);

        if (totalCount === 0) {
          console.log('No attributes found');
          setAttributes([]);
          setIsFetching(false);
          return;
        }

        // Step 3: Load all attributes in batches
        const allAttributes: Array<{ trait_type: string; value_string: string; token_id: number }> = [];
        const batchSize = 1000;
        
        for (let offset = 0; offset < totalCount; offset += batchSize) {
          const response = await post(scanApi, {
            ...gqlQueryV2,
            variables: {
              collectionId,
              limit: batchSize,
              offset: offset
            }
          });

          if (response.status === 200) {
            const batch = response?.data?.data?.attributes?.data || [];
            allAttributes.push(...batch);
          }
        }

        // Step 4: Aggregate by counting UNIQUE token_ids for each trait_type + value_string
        const statsMap = new Map<string, { trait_type: string; value_string: string; tokenIds: Set<number> }>();
        
        allAttributes.forEach((attr) => {
          const key = `${attr.trait_type}_${attr.value_string}`;
          const existing = statsMap.get(key);
          
          if (existing) {
            // Add token_id to the set (automatically handles duplicates)
            existing.tokenIds.add(attr.token_id);
          } else {
            // Create new entry with Set of token_ids
            statsMap.set(key, {
              trait_type: attr.trait_type,
              value_string: attr.value_string,
              tokenIds: new Set([attr.token_id])
            });
          }
        });
        
        // Convert to final format with count of unique tokens
        const statistics: AttributeStatisticV2[] = Array.from(statsMap.values()).map(stat => ({
          trait_type: stat.trait_type,
          value_string: stat.value_string,
          count: stat.tokenIds.size // Count of UNIQUE tokens
        }));
        
        setAttributes(statistics);
        
      } catch (error) {
        console.error('Error loading attributes:', error);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [settings, chainProperties?.SS58Prefix, collectionId, currentChainId]);

  return {
    isFetching,
    attributes
  };
};
