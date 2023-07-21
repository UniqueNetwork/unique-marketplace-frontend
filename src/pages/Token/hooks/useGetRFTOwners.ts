import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import config from '../../../config';

const gqlQuery = {
  operationName: 'fractional_owners_query',
  query: `query fractional_owners_query(
    $collectionId: Float, $tokenId: Float, $limit: Int, $offset: Int
  ) {
    token_owners(
      where: {
        collection_id: { _eq: $collectionId }
        token_id: { _eq: $tokenId }
        amount: { _neq: "0" }
      }
      offset: $offset
      limit: $limit
    ) {
      count
      data {
        amount
        owner
        owner_normalized
      }
    }
  }`
};

export interface FractionalOwner {
  owner: string
  amount: string
}

export const useGetRFTOwners = () => {
  const { settings, currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [owners, setOwners] = useState<FractionalOwner[]>([]);
  const [totalOwners, setTotalOwners] = useState(0);

  const fetchOwners = useCallback(async (collectionId: number, tokenId: number, limit: number, offset: number) => {
    setIsFetching(true);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        collectionId,
        tokenId,
        limit,
        offset
      }
    });
    if (response.status === 200) {
      const owners = response?.data?.data?.token_owners?.data as FractionalOwner[] || [];
      setOwners(owners);
      setTotalOwners(response?.data?.data?.count || 0);
      setIsFetching(false);
      return owners;
    }
    setIsFetching(false);
    return [];
  }, [settings, chainProperties?.SS58Prefix]);

  return {
    isFetching,
    owners,
    totalOwners,
    fetchOwners
  };
};
