import { useApi } from 'hooks/useApi';
import { MarketAccount } from 'account/AccountContext';
import { defaultParams } from 'api/restApi/base/axios';
import { deleteRequest, patch, post } from 'api/restApi/base';
import { MyCollection, MyCollectionBackend, SetCollectionTokensPayload } from 'api/restApi/collections/types';
import { useCallback, useContext, useState } from 'react';
import CollectionsContext from 'collections/CollectionsContext';

const getCollectionsEndpoint = 'https://api-opal.uniquescan.io/v1/graphql';
const endpoint = '/collections';

// export const getCollections = (baseURL: string, jwToken: string) => get(`${endpoint}/collections`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });
export const addCollection = (baseURL: string, id: number) => patch(`${endpoint}/add?collectionId=${id}`, {}, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });
export const deleteCollections = (baseURL: string, id: number) => deleteRequest(`${endpoint}/${id}`, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });
export const setCollectionTokens = (baseURL: string, { collectionId, tokens }: SetCollectionTokensPayload) => post(`${endpoint}/tokens/${collectionId}`, { tokens }, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });

export const useCollections = () => {
  const { api, settings } = useApi();
  const { isFetching: isFetchingFeaturedCollections, collections: featuredCollections, fetchCollections: fetchFeaturedCollections } = useContext(CollectionsContext);
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<MyCollection[]>([]);
  const { baseURL, currentChainId } = useApi();

  const getCollection = useCallback(async (collectionId: number) => {
    const collection = featuredCollections.find(({ id }) => collectionId === id);
    return collection || await api?.collection?.getCollection(Number(collectionId));
  }, [api?.collection, featuredCollections]);

  const getMyCollectionsWithMarketable = useCallback((backendMyCollections: MyCollectionBackend[]) => {
    return backendMyCollections.map((bmc) => {
      const allowedCollection = settings?.blockchain.unique.collections[bmc.id];
      // console.log('useEffect in collections: ', { ...bmc, isMarketable: !!allowedCollection, allowedTokens: allowedCollection?.allowedTokens || undefined });
      return { ...bmc, isMarketable: !!allowedCollection, allowedTokens: allowedCollection?.allowedTokens || undefined } as MyCollection;
    });
  }, [settings]);

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
      const myCollections = getMyCollectionsWithMarketable(backendMyCollections);
      console.log('settings in collection fetch', settings);
      setCollections(myCollections);
    }
    setIsFetching(false);
  }, [settings, getMyCollectionsWithMarketable]);

  const appendCollection = useCallback(async (id: number) => {
    setIsFetching(true);
    const response = await addCollection(baseURL, id);
    setIsFetching(false);
    return response.status === 200;
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
    // TODO: get rid of featuredCollections and, perhaps, CollectionContext as well
    featuredCollections,
    collections,
    isFetching,
    getCollection,
    fetchCollections,
    appendCollection,
    removeCollection,
    setAllowedTokens
  };
};
