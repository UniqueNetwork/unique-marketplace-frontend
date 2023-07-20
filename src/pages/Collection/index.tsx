import React, { useEffect, useState } from 'react';
import { useApi } from 'hooks/useApi';

import { useNavigate, useParams } from 'react-router-dom';
import { CollectionDetail } from './CollectionDetail/CollectionDetail';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { Error404 } from 'pages/Errors/404';
import { RFTCollectionPage } from './RFTCollection';
import { NFTCollectionPage } from './NFTCollection';

export const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>();
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const { currentChainId, api } = useApi();

  const isRFTCollection = collection?.mode === 'ReFungible';

  useEffect(() => {
    if (!api?.collection) return;
    const id = Number(collectionId);
    void (async () => {
      const collection = await api?.collection?.getCollection(id);
      setCollection(collection);
      setIsFetching(false);
    })();
  }, [currentChainId, collectionId, api?.collection]);

  if (isFetching) return <CollectionDetail />;

  if (!collection) return <Error404 />;

  if (isRFTCollection) return <RFTCollectionPage collection={collection} />;

  return <NFTCollectionPage collection={collection} />;
};
