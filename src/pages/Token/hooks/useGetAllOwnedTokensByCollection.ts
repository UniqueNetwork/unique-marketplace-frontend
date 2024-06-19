import { TokenId } from '@unique-nft/sdk';
import { useAccounts } from 'hooks/useAccounts';
import { useEffect, useState } from 'react';
import { NestedTokenItem } from '../types';
import { useGetTokensCollection } from './useGetTokensCollection';
import { useQueryBundleTree } from 'api/scanApi/useQueryBundleTree';
import { GQLToken } from 'api/scanApi/types';

export const useGetAllOwnedTokensByCollection = (
  collectionId?: number,
  options?: { excludeTokenId?: TokenId }
) => {
  const { selectedAccount } = useAccounts();
  const [tokens, setTokens] = useState<GQLToken[]>([]);

  const { fetchTokens, isFetching } = useGetTokensCollection();

  const { fetchBundle, isFetching: isBundleFetching } = useQueryBundleTree();

  useEffect(() => {
    if (!collectionId) return;
    void (async () => {
      const [tokensData] = (await fetchTokens(collectionId, selectedAccount)) || [];
      const nestedTokens = await Promise.all(tokensData.map(async (token) => {
        if (token.nested) {
          const bundleData = await fetchBundle({
            collectionId: token.collectionId,
            tokenId: token.tokenId
          });

          const getTokensFromBundle = (nestedToken: NestedTokenItem): GQLToken[] => {
            if (collectionId !== nestedToken.collectionId) return [];
            const tokenData: GQLToken = {
              ...nestedToken,
              nested: true,
              attributes: []
            };
            if (!nestedToken.nestingChildren) {
              return [tokenData];
            }

            const children = nestedToken.nestingChildren.map(getTokensFromBundle);

            return [tokenData, ...children.flat()];
          };

          return [token, ...bundleData.map(getTokensFromBundle).flat()];
        }
        return [token];
      }));

      setTokens(
        [...(nestedTokens?.flat() || [])]
          .reduce<GQLToken[]>(
            (acc, _token) =>
              acc.find(({ collectionId, tokenId }) => collectionId === _token.collectionId && tokenId === _token.tokenId)
                ? acc
                : [...acc, _token],
            []
          )
          .filter(({ tokenId }) => options?.excludeTokenId?.tokenId !== tokenId)
          .sort((tokenA, tokenB) => (tokenA.tokenId > tokenB.tokenId ? 1 : -1))
      );
    })();
  }, [collectionId, options]);

  return {
    tokens,
    isFetchingTokens: isFetching || isBundleFetching
  };
};
