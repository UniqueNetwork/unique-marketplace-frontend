import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { AttributeCount } from './types';

const endpoint = '/api/attribute-counts';

export const getAttributeCounts = (collectionIds: number[]) => get<AttributeCount[]>(`${endpoint}/`, { ...defaultParams, params: { collectionId: collectionIds } });

export const useAttributeCounts = () => {
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback(async (collectionIds: number[]) => {
    setIsFetching(true);
    try {
      const { status, data } = await getAttributeCounts(collectionIds);
      if (status === 200) {
        setAttributeCounts(data);
        setIsFetching(false);
        return data;
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
      setIsFetching(false);
      getAttributeCounts([]);
    }
    return [];
  }, [getAttributeCounts, setIsFetching]);

  const reset = useCallback(() => {
    getAttributeCounts([]);
    setIsFetching(false);
    setFetchingError(undefined);
  }, [getAttributeCounts]);

  return {
    attributeCounts,
    fetch,
    reset,
    fetchingError,
    isFetching
  };
};
