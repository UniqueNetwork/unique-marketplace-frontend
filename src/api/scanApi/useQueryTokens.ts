import config from 'config';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';
import { post } from 'api/restApi/base';
import { GQLToken } from './types';
import { Address } from '@unique-nft/utils';
import { Account } from 'account/types';

const gqlQuery = {
  operationName: 'tokens_query',
  query: `query tokens_by_collection_query(\
    $where: TokenWhereParams
    $offset: Int
    $limit: Int
    $orderBy: TokenOrderByParams = {}
  ) {
    tokens(
      where: $where
      limit: $limit
      offset: $offset
      order_by: $orderBy
    ) {
      count
      data {
        owner
        tokenId: token_id
        tokenName: token_name
        tokenPrefix: token_prefix
        collectionId: collection_id
        collectionName: collection_name
        collectionCover: collection_cover
        collectionOwner: collection_owner
        creationDate: date_of_creation
        image
        nested
        parent: parent_id
        attributes
        type
        tokensAmount: tokens_amount
        totalPieces: total_pieces
      }
    }
  }`
};

const tokensOnPage = 21;

type FetchTokensParams = {
  limit?: number
  offset?: number
  owner?: string
  searchText?: string
  collectionIds?: number[]
  type?: 'NFT' | 'ReFungible' | 'Fungible'
  orderBy?: { token_id: 'asc' | 'desc' }
}

type FetchTokensForNestingParams = {
  page: number,
  searchText?: string,
  restrictedCollections?: number[],
  nestedTokens: GQLToken[],
}

export const useQueryTokens = () => {
  const { currentChainId, chainProperties, api } = useApi();
  const [isFetching, setIsFetching] = useState(false);

  const fetchFile = useCallback(async (token: GQLToken): Promise<GQLToken> => {
    const response = await api?.nft?.getToken(token.collectionId, token.tokenId);
    return { ...token, file: response?.file };
  }, [api?.nft]);

  const fetch = useCallback(async ({ owner, collectionIds, type, limit, offset, searchText, orderBy }: FetchTokensParams): Promise<[GQLToken[], number]> => {
    setIsFetching(true);

    const { scanApi } = config.blockchains[currentChainId || ''] || {};
    const response = await post(scanApi, {
      ...gqlQuery,
      variables: {
        limit: limit || 10000,
        offset: offset || 0,
        orderBy: orderBy || { token_id: 'asc' },
        where: {
          burned: { _eq: 'false' },
          ...(collectionIds ? { collection_id: { _in: collectionIds } } : {}),
          ...(type ? { type: { _eq: type } } : {}),
          ...(searchText ? getSearchConditions(searchText) : {}),
          ...(owner
            ? { _or: [
              { owner: { _eq: owner } },
              {
                owner_normalized: {
                  _eq: Address.is.ethereumAddressInAnyForm(owner)
                  ? Address.mirror.ethereumToSubstrate(owner)
                  : Address.normalize.substrateAddress(owner)
                }
              }
            ] }
          : {})
        }
      }
    });
    if (response.status === 200) {
      const tokens = response?.data?.data?.tokens?.data as GQLToken[] | [];
      setIsFetching(false);
      return [tokens || [], response?.data?.data?.tokens?.count || 0];
    }
    setIsFetching(false);
    return [[], 0];
  }, [currentChainId]);

  const fetchTokensForNesting = useCallback(async (params: FetchTokensForNestingParams, selectedAccount?: Account): Promise<[GQLToken[], number]> => {
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
    let _nested: GQLToken[] = [];

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
      const tokens = await Promise.all((response?.data?.data?.tokens?.data as GQLToken[] || []).map(fetchFile));
      const total = (response.data?.data?.tokens.count as number) + nestedTokens.length;

      setIsFetching(false);
      return [[..._nested, ...tokens], total];
    }
    setIsFetching(false);
    return [[], 0];
  }, [chainProperties?.SS58Prefix, currentChainId, fetchFile]);

  return {
    isFetching,
    fetch,
    fetchTokensForNesting,
    fetchFile
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
