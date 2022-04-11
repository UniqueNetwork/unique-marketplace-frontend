import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { Trait, TraitsResponse } from './types';

const endpoint = '/api/traits';

export const getTraits = (collectionId: string | number) => get<TraitsResponse>(`${endpoint}/${collectionId}`, { ...defaultParams });

export const useTraits = () => {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback((collectionId: string | number) => {
    setIsFetching(true);
    getTraits(collectionId).then((response) => {
      if (response.status === 200) {
        setTraits(response.data.traits);
        setIsFetching(false);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
      setIsFetching(false);
      setTraits([]);
    });
  }, [setTraits, setIsFetching]);

  const reset = useCallback(() => {
      setTraits([]);
      setIsFetching(false);
      setFetchingError(undefined);
  }, [setTraits]);

  return {
    traits,
    fetch,
    reset,
    fetchingError,
    isFetching
  };
};
