import { get } from 'api/restApi/base';
import { useEffect, useState } from 'react';

export type AttributeStatistic = {
  traitType: string;
  value: string;
  count: number;
};

type TraitsResponse = {
  traits: AttributeStatistic[];
  totalTokens: number;
};

export const useQueryAttributes = (collectionId: number) => {
  const [isFetching, setIsFetching] = useState(false);
  const [attributes, setAttributes] = useState<AttributeStatistic[]>([]);

  useEffect(() => {
    void (async () => {
      setIsFetching(true);

      try {
        const url = `https://api-unique.uniquescan.io/v2/collections/${collectionId}/traits`;
        
        const response = await get(url);

        if (response.status === 200) {
          const data = response.data as TraitsResponse;
          setAttributes(data.traits || []);
        }
      } catch (error) {
        console.error('Error loading attributes:', error);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [collectionId]);

  return {
    isFetching,
    attributes
  };
};
