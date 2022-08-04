import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { ResponseError } from '../base/types';
import { Attribute, AttributesResponse } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/attributes';

export const getAttributes = (collectionId: string | number, currentChainId: string) => get<AttributesResponse>(`${endpoint}/${collectionId}`, { ...defaultParams, params: { network: currentChainId } });

export const useAttributes = () => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { currentChainId = 'unique' } = useApi();

  const fetch = useCallback(async (collectionId: string | number) => {
    setIsFetching(true);
    try {
      const { status, data } = await getAttributes(collectionId, currentChainId);
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
  }, [setAttributes, setIsFetching, currentChainId]);

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
