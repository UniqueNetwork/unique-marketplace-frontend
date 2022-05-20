import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { AttributeCount } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/attribute-counts';

export const getAttributeCounts = (collectionIds: number[]) => get<AttributeCount[]>(`${endpoint}/`, { ...defaultParams, params: { collectionId: collectionIds } });

export const useAttributeCounts = () => {
  const { settings } = useApi();
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback((collectionIds: number[]) => {
    setIsFetching(true);
    getAttributeCounts(collectionIds).then((response) => {
      if (response.status === 200) {
        setAttributeCounts(response.data);
        setIsFetching(false);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
      setIsFetching(false);
      getAttributeCounts([]);
    });
  }, [getAttributeCounts, setIsFetching]);

  const reset = useCallback(() => {
    getAttributeCounts([]);
    setIsFetching(false);
    setFetchingError(undefined);
  }, [getAttributeCounts]);

  useEffect(() => {
    if (settings && settings.blockchain.unique.collectionIds.length > 0 && attributeCounts.length === 0) {
      fetch(settings?.blockchain.unique.collectionIds || []);
    }
  }, [settings?.blockchain.unique.collectionIds]);

  return {
    attributeCounts,
    fetch,
    reset,
    fetchingError,
    isFetching
  };
};
