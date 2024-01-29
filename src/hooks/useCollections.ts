import { useCallback, useContext, useEffect, useState } from 'react';
import { useApi } from 'hooks/useApi';
import { Account } from 'account/types';
import { defaultParams } from 'api/restApi/base/axios';
import { deleteRequest, patch, post } from 'api/restApi/base';
import { MyCollection, SetCollectionTokensPayload } from 'api/restApi/collections/types';
import CollectionsContext from 'collections/CollectionsContext';
import config from '../config';
import { Address } from '@unique-nft/utils';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

const endpoint = '/collections';

// export const getCollections = (baseURL: string, jwToken: string) => get(`${endpoint}/collections`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${jwToken}` }, ...defaultParams, baseURL });
export const addCollection = (baseURL: string, id: number) => patch(`${endpoint}/add?collectionId=${id}`, {}, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });
export const deleteCollections = (baseURL: string, id: number) => deleteRequest(`${endpoint}/${id}`, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });
export const setCollectionTokens = (baseURL: string, { collectionId, tokens }: SetCollectionTokensPayload) => patch(`${endpoint}/allowed/tokens/${collectionId}`, { tokens }, { headers: { ...defaultParams.headers }, ...defaultParams, baseURL });

type CustomizableCollectionRelationship = Record<number, number[]>;

export const useCollections = () => {
  const { api, baseURL, settings, currentChainId } = useApi();
  const { collections: featuredCollections } = useContext(CollectionsContext);
  const [isFetching, setIsFetching] = useState(false);
  const [collections, setCollections] = useState<MyCollection[]>([]);
  const [customizableCollections, setCustomizableCollections] = useState<CustomizableCollectionRelationship>({});

  useEffect(() => {
    const customizableCollections = [...collections, ...featuredCollections].reduce<CustomizableCollectionRelationship>((acc, { id, properties, permissions }) => {
      if (properties.find(({ key }) => key === 'is_customizable')) {
        acc[id] = permissions?.nesting?.restricted || [];
      }
      return acc;
    }, {});

    setCustomizableCollections((value) => {
      return {
        ...value,
        ...customizableCollections
      };
    });
  }, [featuredCollections, collections]);

  const getCollection = useCallback(async (collectionId: number) => {
    const collection = featuredCollections.find(({ id }) => collectionId === id) || collections.find(({ id }) => collectionId === id);

    return collection as CollectionInfoWithSchemaResponse || await api?.collection?.getCollection(Number(collectionId));
  }, [api?.collection, featuredCollections]);

  const getCollectionTokensCount = useCallback(async (collectionId: number) => {
    const gqlQuery = {
      operationName: 'collections_by_account_query',
      query: `query collections_by_account_query($id: Float) {
        collections(
          where: {collection_id: {_eq: $id}, burned: {_eq: "false"}}
          limit: 1
        ) {
          count
          data {
            id: collection_id
            tokensCount: tokens_count
            __typename
          }
          __typename
        }
      }`,
      variables: {
        id: collectionId
      }
    };
    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, gqlQuery);
    if (response.status === 200) {
      const backendMyCollections = response?.data?.data?.collections?.data as { tokensCount: number }[] | [];
      return backendMyCollections[0].tokensCount || 0;
    }
    return 0;
  }, [settings]);

  const getMyCollectionsWithMarketable = useCallback((backendMyCollections: MyCollection[]) => {
    return backendMyCollections.map((bmc) => {
      const allowedCollection = settings?.blockchain.unique.collections[bmc.id];
      return { ...bmc, isMarketable: !!allowedCollection, allowedTokens: allowedCollection?.allowedTokens || undefined } as MyCollection;
    });
  }, [settings]);

  const fetchCollections = useCallback(async (account: Account | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const address = account.address;
    const gqlQuery = {
      operationName: 'collections_by_account_query',
      query: `query collections_by_account_query($owner: String, $owner_normalized: String) {
        collections(
          where: {_or: [{owner: {_eq: $owner}}, {owner_normalized: {_eq: $owner_normalized}}], burned: {_eq: "false"}}
          distinct_on: collection_id
          limit: 1000
        ) {
          count
          data {
            owner: owner_normalized
            cover: collection_cover
            id: collection_id
            name: name
            tokenPrefix: token_prefix
            properties
            permissions
            __typename
          }
          __typename
        }
      }`,
      variables: {
        owner: address,
        owner_normalized: Address.is.ethereumAddressInAnyForm(address)
          ? Address.mirror.ethereumToSubstrate(address)
          : Address.normalize.substrateAddress(address)
      }
    };

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, gqlQuery);
    if (response.status === 200) {
      // TODO: merge with data from "collections" in settings to highlight already "added" collections
      const backendMyCollections = response?.data?.data?.collections?.data as MyCollection[] | [];
      const myCollections = getMyCollectionsWithMarketable(backendMyCollections);
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

  const collectionIsCustomizable = useCallback((collectionId: number) => {
    return !!customizableCollections[collectionId];
  }, [customizableCollections]);

  const collectionIsWearable = useCallback((collectionId: number) => {
    return Object.values(customizableCollections).flat().includes(collectionId);
  }, [customizableCollections]);

  return {
    // TODO: get rid of featuredCollections and, perhaps, CollectionContext as well
    featuredCollections,
    collections,
    isFetching,
    getCollection,
    fetchCollections,
    appendCollection,
    removeCollection,
    setAllowedTokens,
    getCollectionTokensCount,
    customizableCollections,
    collectionIsCustomizable,
    collectionIsWearable
  };
};
