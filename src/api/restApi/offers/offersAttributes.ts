import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
import { get } from '../base';
import { defaultParams } from '../base/axios';
import { Attribute, AttributeCount, OfferFilters, OffersAttributesResponse } from './types';
import { ResponseError } from '../base/types';
import { useApi } from '../../../hooks/useApi';

const offersAttributesEndpoint = '/Offers/offers-attributes';

export const emptyAttributesResponse: OffersAttributesResponse = {
  attributes: {},
  attributesCount: [],
};

export const getOffersAttributes = (baseURL: string, payload: OfferFilters) =>
  get<OffersAttributesResponse>(offersAttributesEndpoint, {
    ...defaultParams,
    baseURL,
    params: payload,
  });

export const useOffersAttributes = () => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [isFetchingAttributes, setIsFetchingAttributes] = useState<boolean>(false);
  const [fetchingAttributesError, setFetchingAttributesError] = useState<ResponseError | undefined>();
  const { baseURL } = useApi();

  const fetchAttributes = useCallback(async (payload: OfferFilters): Promise<OffersAttributesResponse> => {
    setIsFetchingAttributes(true);
    setFetchingAttributesError(undefined);
    try {
      const { status, data } = await getOffersAttributes(baseURL, payload);

      if (status === 200) {
        setAttributes(data.attributes);
        setAttributeCounts(data.attributesCount);
        return data;
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingAttributesError({
        status: response?.status,
        message,
      });
    } finally {
      setIsFetchingAttributes(false);
    }
    return emptyAttributesResponse;
  }, [baseURL]);

  return {
    attributes,
    attributeCounts,
    isFetchingAttributes,
    fetchingAttributesError,
    fetchAttributes,
  };
};
