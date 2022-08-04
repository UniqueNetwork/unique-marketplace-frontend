import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { AttributeCount } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/attribute-counts';

export const getAttributeCounts = (collectionIds: number[], currentChainId: string) => get<AttributeCount[]>(`${endpoint}/`, { ...defaultParams, params: { collectionId: collectionIds, network: currentChainId } });

export const useAttributeCounts = () => {
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { currentChainId = 'unique' } = useApi();

  const fetch = useCallback(async (collectionIds: number[]) => {
    setIsFetching(true);
    try {
      const { status, data } = await getAttributeCounts(collectionIds, currentChainId);
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
      getAttributeCounts([], currentChainId);
    }
    return [];
  }, [getAttributeCounts, setIsFetching, currentChainId]);

  const reset = useCallback(() => {
    getAttributeCounts([], currentChainId);
    setIsFetching(false);
    setFetchingError(undefined);
  }, [getAttributeCounts, currentChainId]);

  return {
    attributeCounts,
    fetch,
    reset,
    fetchingError,
    isFetching
  };
};
