import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { Attribute, AttributesResponse } from './types';

const endpoint = '/api/attributes';

export const getAttributes = (collectionId: string | number) => get<AttributesResponse>(`${endpoint}/${collectionId}`, { ...defaultParams });

export const useAttributes = () => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback((collectionId: string | number) => {
    setIsFetching(true);
    getAttributes(collectionId).then((response) => {
      if (response.status === 200) {
        setAttributes(response.data.attributes);
        setIsFetching(false);
      }
    }).catch((err: AxiosError) => {
      setFetchingError({
        status: err.response?.status,
        message: err.message
      });
      setIsFetching(false);
      setAttributes({});
    });
  }, [setAttributes, setIsFetching]);

  const reset = useCallback(() => {
    setAttributes({});
    setIsFetching(false);
    setFetchingError(undefined);
  }, [setAttributes]);

  return {
    attributes,
    fetch,
    reset,
    fetchingError,
    isFetching
  };
};
