import { useCallback, useState } from 'react';

import { post, get, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { JWTokenLocalStorageKey } from './login';
import { NFTCollection } from '../../chainApi/unique/types';

const endpoint = '/api/admin/collections';

export const getCollections = () => get(`${endpoint}`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const addCollection = (id: number) => post(`${endpoint}`, { collectionId: id }, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const deleteCollections = (id: number) => deleteRequest(`${endpoint}/${id}`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });

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

  return {
    collections,
    isFetching,
    fetch,
    add,
    remove
  };
};
