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

  const fetch = useCallback(async (collectionId: string | number) => {
    setIsFetching(true);
    try {
      const { status, data } = await getAttributes(collectionId);
      if (status === 200) {
        setAttributes(data.attributes);
        setIsFetching(false);
        return data.attributes;
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
      setIsFetching(false);
      setAttributes({});
    }
    return {};
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
