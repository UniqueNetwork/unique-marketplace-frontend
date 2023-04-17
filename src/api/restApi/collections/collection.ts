import { useCallback, useState } from 'react';

import { post, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { MyCollection, MyCollectionBackend, SetCollectionTokensPayload } from './types';
import { useApi } from 'hooks/useApi';
import { MarketAccount } from 'account/AccountContext';

const getCollectionsEndpoint = 'https://api-opal.uniquescan.io/v1/graphql';
const endpoint = '/api/admin';

// export const getCollections = (baseURL: string, jwToken: string) => get(`${endpoint}/collections`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });
export const addCollection = (baseURL: string, id: number) => post(`${endpoint}/collections`, { collectionId: id }, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });
export const deleteCollections = (baseURL: string, id: number) => deleteRequest(`${endpoint}/collections/${id}`, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });
export const setCollectionTokens = (baseURL: string, { collectionId, tokens }: SetCollectionTokensPayload) => post(`${endpoint}/tokens/${collectionId}`, { tokens }, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });

export const useCollections = () => {
  const { settings } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<MyCollection[]>([]);
  const { baseURL, currentChainId } = useApi();

  const fetchCollections = useCallback(async (account: MarketAccount | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const address = account.address;
    const gqlQuery = {
      operationName: 'collections_by_tokens_owner_query',
      query: `query collections_by_tokens_owner_query($owner: String) {
        tokens(
          where: {_or: [{tokens_owner: {_eq: $owner}}, {owner_normalized: {_eq: $owner}}], burned: {_eq: "false"}}
          distinct_on: collection_id
          limit: 1000
        ) {
          count
          data {
            owner: owner_normalized
            cover: collection_cover
            id: collection_id
            name: collection_name
            tokenPrefix: token_prefix
            __typename
          }
          __typename
        }
      }`,
      variables: {
        owner: address
      }
    };
    const response = await post(getCollectionsEndpoint, gqlQuery);
    if (response.status === 200) {
      // TODO: merge with data from "collections" in settings to highlight already "added" collections
      const backendMyCollections = response?.data?.data?.tokens?.data as MyCollectionBackend[] | [];
      const myCollections = backendMyCollections.map((bmc) => {
        const allowedCollection = settings?.blockchain.unique.collections[bmc.id];
        return { ...bmc, isMarketable: !!allowedCollection, allowedTokens: allowedCollection?.allowedTokens || undefined } as MyCollection;
      });
      setCollections(myCollections);
    }
    setIsFetching(false);
  }, [baseURL, currentChainId]);

  const appendCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await addCollection(baseURL, id);
    setIsFetching(false);
    return response.status === 201;
  }, [baseURL]);

  const removeCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await deleteCollections(baseURL, id);
    setIsFetching(false);
    return response.status === 200;
  }, [baseURL]);

  const setAllowedTokens = useCallback(async (collectionId: number, tokens: string) => {
    setIsFetching(true);
    await setCollectionTokens(baseURL, { collectionId, tokens });
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
