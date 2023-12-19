import { post } from 'api/restApi/base';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useState } from 'react';
import { Address } from '@unique-nft/utils';
import config from '../../../../config';
import { useAccounts } from 'hooks/useAccounts';
import { TokenItem } from 'pages/Token/types';

const gqlQuery = {
  operationName: 'tokens_by_collection_query',
  query: `query tokens_by_collection_query(\
    $where: TokenWhereParams
    $offset: Int
    $limit: Int
  ) {
    tokens(
      where: $where
      limit: $limit
      offset: $offset
      order_by: { token_id: asc }
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

type FetchTokensParams = {
  page: number,
  searchText?: string,
  restrictedCollections?: number[],
  nestedTokens: TokenItem[],
}

const tokensOnPage = 21;

export const useGetTokensForNesting = ({ parentToken }: UseGetTokensForNestingProps) => {
  const { currentChainId, chainProperties } = useApi();
  const { selectedAccount } = useAccounts();
  const [isFetching, setIsFetching] = useState(false);
  const [isNestedFetching, setIsNestedFetching] = useState(false);

  const fetchNestedTokens = useCallback(async (): Promise<TokenItem[]> => {
    setIsNestedFetching(true);
    const parentAddress = Address.nesting.idsToAddress(parentToken.collectionId, parentToken.tokenId);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        limit: 1000,
        offset: 0,
        where: {
          owner: { _eq: parentAddress.toLowerCase() },
          burned: { _eq: 'false' },
          type: { _eq: 'NFT' }
        }
      }
    });
    setIsNestedFetching(false);

    if (response.status === 200) {
      return response?.data?.data?.tokens?.data as TokenItem[] || [];
    }
    return [];
  }, [currentChainId, parentToken.collectionId, parentToken.tokenId]);

  const fetchTokens = useCallback(async (params: FetchTokensParams): Promise<[TokenItem[], number]> => {
    if (!selectedAccount) return [[], 0];

    const { page, searchText, restrictedCollections } = params;
    const nestedTokens = searchText
      ? params.nestedTokens.filter(({ tokenId, collectionName }) => {
        if (!Number.isNaN(Number(searchText))) {
          return tokenId === Number(searchText) || collectionName?.includes(searchText);
        }
        return collectionName?.includes(searchText);
      })
      : params.nestedTokens;
    let _nested: TokenItem[] = [];

    const nestedPages = Math.floor(nestedTokens.length / tokensOnPage);

    if (nestedPages >= page) {
      _nested = nestedTokens.length > tokensOnPage
        ? nestedTokens.slice(page * tokensOnPage, (page + 1) * tokensOnPage - 1)
        : nestedTokens;
    }

    const forwardPage = page > nestedPages ? page - nestedPages : 0;
    const forwardOffset = nestedTokens.length < tokensOnPage
      ? nestedTokens.length
      : nestedTokens.length - (nestedPages * tokensOnPage);

    const offset = forwardPage * (tokensOnPage - _nested.length) - (forwardPage > 0 ? forwardOffset : 0);
    const limit = tokensOnPage - _nested.length;

    setIsFetching(true);
    const accountAddress = Address.is.substrateAddressInAnyForm(selectedAccount.address)
      ? Address.normalize.substrateAddress(selectedAccount.address, chainProperties?.SS58Prefix)
      : selectedAccount.address;

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        offset,
        limit,
        where: {
          owner: { _eq: accountAddress },
          ...(searchText ? getSearchConditions(searchText) : {}),
          burned: { _eq: 'false' },
          type: { _eq: 'NFT' },
          ...(restrictedCollections ? { collection_id: { _in: restrictedCollections } } : {})
        }
      }
    });

    if (response.status === 200) {
      const tokens = response?.data?.data?.tokens?.data as TokenItem[] | [];
      const total = (response.data?.data?.tokens.count as number) + nestedTokens.length;

      setIsFetching(false);
      return [[..._nested, ...tokens], total];
    }
    setIsFetching(false);
    return [[], 0];
  }, [selectedAccount, isNestedFetching, chainProperties?.SS58Prefix, currentChainId]);

  return {
    isFetching,
    isNestedFetching,
    fetchTokens,
    fetchNestedTokens
  };
};

const getSearchConditions = (searchText: string) => {
  if (!Number.isNaN(Number(searchText))) {
    return {
      _or: [
        { token_id: { _eq: Number(searchText) } },
        { collection_name: { _like: `%${searchText}%` } }
      ]
    };
  }
  return {
    collection_name: { _like: `%${searchText}%` }
  };
};
