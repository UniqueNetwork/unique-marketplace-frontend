import { LastTokenIdResultDto } from '@unique-nft/sdk';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useState } from 'react';

export const useCollectionGetLastTokenId = (collectionId?: number) => {
  const { api } = useApi();
  const [lastTokenIdDto, setLastTokenIdDto] = useState<LastTokenIdResultDto | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetch = useCallback(async () => {
    if (!api?.collection || !collectionId) return;
    setIsFetching(true);
    const lastTokenIdDto = await api.collection.getLastTokenId(collectionId);
    setLastTokenIdDto(lastTokenIdDto);
    setIsFetching(false);
  }, [collectionId, api]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return {
    lastTokenIdDto,
    isFetching,
    refetch: fetch
  };
};
