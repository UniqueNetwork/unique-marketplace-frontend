import { useCallback, useState } from 'react';

import { post, get, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { JWTokenLocalStorageKey } from './login';
import { NFTCollection } from '../../chainApi/unique/types';
import { SetCollectionTokensPayload } from './types';

const endpoint = '/api/admin';

export const getCollections = () => get(`${endpoint}/collections`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const addCollection = (id: number) => post(`${endpoint}/collections`, { collectionId: id }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const deleteCollections = (id: number) => deleteRequest(`${endpoint}/collections/${id}`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const setCollectionTokens = ({ collectionId, tokens }: SetCollectionTokensPayload) => post(`${endpoint}/tokens/${collectionId}`, { tokens }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });

export const useAdminCollections = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<NFTCollection[]>([]);

  const fetch = useCallback(async () => {
    setIsFetching(true);
    const response = await getCollections();
    setIsFetching(false);
    if (response.status === 200) {
      setCollections(response.data);
    }
  }, []);

  const add = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await addCollection(id);
    setIsFetching(false);
    return response.status === 201;
  }, []);

  const remove = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await deleteCollections(id);
    setIsFetching(false);
    return response.status === 200;
  }, []);

  const setAllowedTokens = useCallback(async (collectionId: number, tokens: string) => {
    setIsFetching(true);
    await setCollectionTokens({ collectionId, tokens });
    setIsFetching(false);
  }, []);

  return {
    collections,
    isFetching,
    fetch,
    add,
    remove,
    setAllowedTokens
  };
};
