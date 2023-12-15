import { Account } from 'account/types';
import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { Address } from '@unique-nft/utils';
import config from '../../../../config';
import { useAccounts } from 'hooks/useAccounts';
import { TokenItem } from 'pages/Token/types';

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
        owner
        tokenId: token_id
        tokenName: token_name
        tokenPrefix: token_prefix
        collectionId: collection_id
        collectionName: collection_name
        image
        nested
        parent: parent_id
      }
    }
  }`
};

type UseGetTokensForNestingProps = {
  parentToken: {
    tokenId: number,
    collectionId: number
  }
}

export const useGetTokensForNesting = ({ parentToken }: UseGetTokensForNestingProps) => {
  const { settings, currentChainId, chainProperties } = useApi();
  const { selectedAccount } = useAccounts();
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState<TokenItem[]>([]);

  const fetchTokens = useCallback(async (restrictedCollections?: number[]) => {
    if (!selectedAccount) return [];
    setIsFetching(true);
    const accountAddress = Address.is.substrateAddressInAnyForm(selectedAccount.address)
      ? Address.normalize.substrateAddress(selectedAccount.address, chainProperties?.SS58Prefix)
      : selectedAccount.address;
    const parentAddress = Address.nesting.idsToAddress(parentToken.collectionId, parentToken.tokenId);

    console.log(parentAddress);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await Promise.all([
      post(scanApi, {
        ...gqlQuery,
        variables: {
          where: {
            owner: { _eq: parentAddress.toLowerCase() },
            burned: { _eq: 'false' },
            type: { _eq: 'NFT' }
          }
        }
      }),
      post(scanApi, {
        ...gqlQuery,
        variables: {
          where: {
            owner: { _eq: accountAddress },
            burned: { _eq: 'false' },
            type: { _eq: 'NFT' },
            ...(restrictedCollections ? { collection_id: { _in: restrictedCollections } } : {})
          }
        }
      })
    ]);

    if (response[0].status === 200 && response[1].status === 200) {
      const nestedTokens = response[0]?.data?.data?.tokens?.data as TokenItem[] | [];
      const otherTokens = response[1]?.data?.data?.tokens?.data as TokenItem[] | [];
      setTokens([...nestedTokens, ...otherTokens]);
      setIsFetching(false);
      return [...nestedTokens, ...otherTokens] || [];
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
