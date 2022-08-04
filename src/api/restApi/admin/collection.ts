import { useCallback, useState } from 'react';

import { post, get, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { JWTokenLocalStorageKey } from './login';
import { CollectionData, SetCollectionTokensPayload } from './types';
import { useApi } from '../../../hooks/useApi';

const endpoint = '/api/admin';

export const getCollections = (currentChainId: string) => get(`${endpoint}/collections`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams, params: { network: currentChainId } });
export const addCollection = (id: number, currentChainId: string) => post(`${endpoint}/collections`, { collectionId: id, network: currentChainId }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const deleteCollections = (id: number, currentChainId: string) => deleteRequest(`${endpoint}/collections/${id}`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams, params: { network: currentChainId } });
export const setCollectionTokens = ({ collectionId, tokens, currentChainId }: SetCollectionTokensPayload) => post(`${endpoint}/tokens/${collectionId}`, { tokens, network: currentChainId }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });

export const useAdminCollections = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const { currentChainId = 'unique' } = useApi();

  const fetchCollections = useCallback(async () => {
    setIsFetching(true);
    const { data: response } = await getCollections(currentChainId);
    if (response.statusCode === 200) {
      setCollections(response.data);
    }
    setIsFetching(false);
  }, [currentChainId]);

  const appendCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await addCollection(id, currentChainId);
    setIsFetching(false);
    return response.status === 201;
  }, [currentChainId]);

  const removeCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await deleteCollections(id, currentChainId);
    setIsFetching(false);
    return response.status === 200;
  }, [currentChainId]);

  const setAllowedTokens = useCallback(async (collectionId: number, tokens: string) => {
    setIsFetching(true);
    await setCollectionTokens({ collectionId, tokens, currentChainId });
    setIsFetching(false);
  }, [currentChainId]);

  return {
    collections,
    isFetching,
    fetchCollections,
    appendCollection,
    removeCollection,
    setAllowedTokens
  };
};
