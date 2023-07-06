import { MarketAccount } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { TokenItem } from '../types';
import config from '../../../config';
import { Address } from '@unique-nft/utils';

const gqlQuery = {
  operationName: 'tokens_by_collection_query',
  query: `query tokens_by_collection_query(\
    $where: TokenWhereParams
  ) {
    tokens(
      where: $where
      offset: 0
      limit: 1000
      order_by: { token_id: asc }
      distinct_on: token_id
    ) {
      count
      data {
        tokenId: token_id
        tokenName: token_name
        tokenPrefix: token_prefix
        collectionId: collection_id
        collectionName: collection_name
        image
        nested
      }
    }
  }`
};

export const useGetTokensCollection = () => {
  const { settings, currentChainId, chainProperties } = useApi();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenItem[]>([]);

  const fetchTokens = useCallback(async (collectionId: number, account: MarketAccount | undefined) => {
    if (!account) return [];
    setIsFetching(true);
    const address = Address.is.substrateAddressInAnyForm(account.address)
      ? Address.normalize.substrateAddress(account.address, chainProperties?.SS58Prefix)
      : account.address;

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        where: {
          tokens_owner: { _eq: address },
          collection_id: { _eq: collectionId },
          burned: { _eq: 'false' }
        }
      }
    });
    if (response.status === 200) {
      const tokens = response?.data?.data?.tokens?.data as TokenItem[] | [];
      setTokens(tokens);
      setIsFetching(false);
      return tokens || [];
    }
    setIsFetching(false);
    return [];
  }, [settings, chainProperties]);

  return {
    isFetching,
    tokens,
    fetchTokens
  };
};
