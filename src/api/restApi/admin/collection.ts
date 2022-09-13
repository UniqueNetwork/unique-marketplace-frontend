import { useCallback, useState } from 'react';

import { post, get, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { useAdminLoggingIn } from './login';
import { CollectionData, SetCollectionTokensPayload } from './types';
import { useApi } from 'hooks/useApi';

const endpoint = '/api/admin';

export const getCollections = (baseURL: string, jwToken: string) => get(`${endpoint}/collections`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });
export const addCollection = (baseURL: string, jwToken: string, id: number) => post(`${endpoint}/collections`, { collectionId: id }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });
export const deleteCollections = (baseURL: string, jwToken: string, id: number) => deleteRequest(`${endpoint}/collections/${id}`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });
export const setCollectionTokens = (baseURL: string, jwToken: string, { collectionId, tokens }: SetCollectionTokensPayload) => post(`${endpoint}/tokens/${collectionId}`, { tokens }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });

export const useAdminCollections = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const { baseURL, currentChainId } = useApi();
  const { getJWToken } = useAdminLoggingIn();

  const fetchCollections = useCallback(async () => {
    setIsFetching(true);
    const jwToken = await getJWToken();
    if (!jwToken) return;
    const { data: response } = await getCollections(baseURL, jwToken);
    if (response.statusCode === 200) {
      setCollections(response.data);
    }
    setIsFetching(false);
  }, [baseURL, currentChainId]);

  const appendCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const jwToken = await getJWToken();
    if (!jwToken) return;
    const response = await addCollection(baseURL, jwToken, id);
    setIsFetching(false);
    return response.status === 201;
  }, [baseURL]);

  const removeCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const jwToken = await getJWToken();
    if (!jwToken) return;
    const response = await deleteCollections(baseURL, jwToken, id);
    setIsFetching(false);
    return response.status === 200;
  }, [baseURL]);

  const setAllowedTokens = useCallback(async (collectionId: number, tokens: string) => {
    setIsFetching(true);
    const jwToken = await getJWToken();
    if (!jwToken) return;
    await setCollectionTokens(baseURL, jwToken, { collectionId, tokens });
    setIsFetching(false);
  }, [baseURL]);

  return {
    collections,
    isFetching,
    fetchCollections,
    appendCollection,
    removeCollection,
    setAllowedTokens
  };
};
