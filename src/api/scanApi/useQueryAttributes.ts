import { get } from 'api/restApi/base';
import config from 'config';
import { useApi } from 'hooks/useApi';
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
  const { currentChainId } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [attributes, setAttributes] = useState<AttributeStatistic[]>([]);

  useEffect(() => {
    void (async () => {
      setIsFetching(true);

      try {
        const scanUrl = config.blockchains[currentChainId || '']?.scanUrl || 'https://api-unique.uniquescan.io/';
        const apiUrl = `${scanUrl.replace(/\/$/, '')}/v2`;
        const url = `${apiUrl}/collections/${collectionId}/traits`;
        
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
  }, [collectionId, currentChainId]);

  return {
    isFetching,
    attributes
  };
};