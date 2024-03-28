import { useCallback, useContext, useEffect, useState } from 'react';
import { useApi } from 'hooks/useApi';
import { Account } from 'account/types';
import { defaultParams } from 'api/restApi/base/axios';
import { deleteRequest, patch, post } from 'api/restApi/base';
import { SetCollectionTokensPayload } from 'api/restApi/collections/types';
import CollectionsContext from 'collections/CollectionsContext';
import { mockWearables } from 'pages/Token/constants';
import { useQueryCollections } from 'api/scanApi/useQueryCollections';
import { GQLCollection } from 'api/scanApi/types';

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
  const [collections, setCollections] = useState<GQLCollection[]>([]);
  const [customizableCollections, setCustomizableCollections] = useState<CustomizableCollectionRelationship>({});
  const { fetchOne, fetch } = useQueryCollections();

  useEffect(() => {
    if (!currentChainId || !mockWearables[currentChainId || '']) return;
    // const customizables = mockWearables[currentChainId].map(({ baseCollections }) => baseCollections).flat();
    // TODO: it replaced with hardcode for customizable collections, need change when release schema 2.0
    // const customizableCollections = [...collections, ...featuredCollections].reduce<CustomizableCollectionRelationship>((acc, { id, permissions }) => {

      // if (properties.find(({ key }) => key === 'is_customizable')) {
      //   acc[id] = permissions?.nesting?.restricted || [];
      // }
    //   if (customizables.includes(id)) {
    //     acc[id] = permissions?.nesting?.restricted || [];
    //   }

    //   return acc;
    // }, {});

    // setCustomizableCollections((value) => {
    //   return {
    //     ...value,
    //     ...customizableCollections
    //   };
    // });

    setCustomizableCollections(mockWearables[currentChainId].reduce<CustomizableCollectionRelationship>((acc, { collectionId, baseCollections }) => {
      acc[baseCollections[0]] = [...(acc[baseCollections[0]] || []), collectionId];
      return acc;
    }, {}));
  }, [featuredCollections, collections, currentChainId]);
  const getCollection = useCallback(async (collectionId: number) => {
    const collection = featuredCollections.find(({ id }) => collectionId === id) || collections.find(({ id }) => collectionId === id);

    return collection || await fetchOne(Number(collectionId));
  }, [fetchOne, featuredCollections]);

  const getCollectionTokensCount = useCallback(async (collectionId: number) => {
    const collection = featuredCollections.find(({ id }) => collectionId === id) || collections.find(({ id }) => collectionId === id);

    return collection?.tokensCount || (await fetchOne(Number(collectionId)))?.tokensCount;
  }, [getCollection]);

  const getMyCollectionsWithMarketable = useCallback((backendMyCollections: GQLCollection[]) => {
    return backendMyCollections.map((bmc) => {
      const allowedCollection = settings?.blockchain.unique.collections[bmc.id];
      return { ...bmc, isMarketable: !!allowedCollection, allowedTokens: allowedCollection?.allowedTokens || undefined } as GQLCollection;
    });
  }, [settings]);

  const fetchCollections = useCallback(async (account: Account | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const { address } = account;

    setCollections(await fetch({
      owner: address
    }));
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
