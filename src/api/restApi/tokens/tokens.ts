import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { Attribute, AttributeCount, GetOffersRequestPayload } from '../offers/types';
import { ResponseError } from '../base/types';
import { useApi } from '../../../hooks/useApi';
import { fromStringToBnString } from '../../../utils/bigNum';
import { GetTokensRequestPayload, Token, TokensResponse } from './types';
import { emptyResponse } from '../offers/offers';

const endpoint = '/tokens';

export const getTokens = (baseURL: string, payload: GetTokensRequestPayload) => get<TokensResponse>(`${endpoint}/${payload.collectionId}`, { ...defaultParams, baseURL, params: payload });

export const useTokens = ({ collectionId }: { collectionId: number }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensCount, setTokensCount] = useState<number>(0);
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();
  const { api, baseURL } = useApi();

  const fetch = useCallback(async ({ minPrice, maxPrice, ...payload }: GetTokensRequestPayload) => {
    setIsFetching(true);
    try {
      const { status, data } = await getTokens(baseURL, {
        ...payload,
        minPrice: minPrice,
        maxPrice: maxPrice,
        collectionId
      });
      if (status === 200) {
        setTokens(data.items);
        setTokensCount(data.totalItems);
        setAttributes(data.attributes);
        setAttributeCounts(data.attributesCount);
        setIsFetching(false);
        return data;
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
    }
    return emptyResponse;
  }, [baseURL, api?.market?.decimals, collectionId]);

  const fetchMore = useCallback(async ({ minPrice, maxPrice, ...payload }: GetTokensRequestPayload) => {
    setIsFetching(true);
    try {
      const { status, data } = await getTokens(baseURL, {
        ...payload,
        minPrice: minPrice && fromStringToBnString(minPrice, api?.market?.decimals),
        maxPrice: maxPrice && fromStringToBnString(maxPrice, api?.market?.decimals),
        collectionId
      });
      if (status === 200) {
        setTokens([...tokens, ...data.items]);
        setIsFetching(false);
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
    }
  }, [baseURL, tokens, api?.market?.decimals, collectionId]);

  return {
    tokens,
    tokensCount,
    isFetching,
    fetchingError,
    fetch,
    fetchMore,
    attributes,
    attributeCounts
  };
};
