import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tokens as gqlTokens, collections as gqlCollections } from '../../../api/graphQL';

import { BuyToken } from './BuyToken/BuyToken';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TokensPageProps {
}

export const TokensPage: FC<TokensPageProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = new URLSearchParams(searchParams);
  const tokenId = query.get('tokenId') || '';
  const collectionId = query.get('collectionId') || '';

  const { token } = gqlTokens.useGraphQlToken(collectionId, tokenId);
  const { collections } = gqlCollections.useGraphQlCollections({ filter: { collection_id: { _eq: collectionId } }, pageSize: 1 });

  return (
    <>
      {token && collections && <BuyToken
        collection={collections[0]}
        token={token}
                               />}
    </>
  );
};
