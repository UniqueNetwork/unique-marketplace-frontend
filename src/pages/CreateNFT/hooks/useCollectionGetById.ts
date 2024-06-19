import { CollectionWithInfoV2Dto } from '@unique-nft/sdk';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useState } from 'react';

export const useCollectionGetById = (collectionId?: number) => {
  const { api } = useApi();
  const [collectionInfo, setCollectionInfo] = useState<CollectionWithInfoV2Dto | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetch = useCallback(async () => {
    if (!api?.collection || !collectionId) return;
    setIsFetching(true);
    const collectionInfo = await api.collection.getCollection(collectionId);
    setCollectionInfo(collectionInfo);
    setIsFetching(false);
  }, [collectionId, api]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return {
    collectionInfo,
    isFetching,
    refetch: fetch
  };
};
