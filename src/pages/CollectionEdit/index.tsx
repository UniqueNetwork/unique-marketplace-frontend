import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import styled from 'styled-components';

import { PagePaper } from 'components/PagePaper/PagePaper';
import { useCollections } from 'hooks/useCollections';
import { CollectionBannerComponent } from './CollectionBanner';
import { Heading } from '@unique-nft/ui-kit';
import { CollectionEditForm } from './Forms/CollectionEditForm';
import { Error404 } from 'pages/Errors/404';
import { CollectionEditSkeleton } from './CollectionEditSkeleton';
import { useApi } from 'hooks/useApi';
import { RoyaltiesForm } from './Forms/RoyaltiesForm';
import { CollectionCover } from './CollectionCover';

export const CollectionEditPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [isFetchingCollection, setIsFetchingCollection] = useState<boolean>(true);
  const { getCollection } = useCollections();
  const { api } = useApi();

  useEffect(() => {
    if (!api?.collection) return;

    setIsFetchingCollection(true);
    void (async () => {
      const collection = await getCollection(Number(collectionId));
      setCollection(collection || null);

      setIsFetchingCollection(false);
    })();
  }, [api, collectionId, setIsFetchingCollection, fetch]);

  const { name, schema } = collection || {};

  const onUploadBanner = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  const onRemoveBanner = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  const onUploadCover = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  const onRemoveCover = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  const initialFormValues = useMemo(() => ({
    description: collection?.description
  }), [collection]);

  const onCollectionEditFormSubmit = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  const onRoyaltiesFormSubmit = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  if (isFetchingCollection) {
    return <CollectionEditPaper>
      <CollectionEditSkeleton />
    </CollectionEditPaper>;
  }

  if (!collection) return <Error404 />;

  return (<CollectionEditPaper>
    <CollectionBannerComponent
      onChange={onUploadBanner}
      onRemove={onRemoveBanner}
    />
    <CollectionEditContentWrapper>
      <CollectionCover
        name={name || ''}
        src={schema?.coverPicture?.fullUrl || ''}
        onChange={onUploadCover}
        onRemove={onRemoveCover}
      />
      <CollectionEditFormWrapper>
        <Heading size='1' >{name}</Heading>
        <CollectionEditForm
          initialFormData={initialFormValues}
          onSubmit={onCollectionEditFormSubmit}
        />
        <RoyaltiesForm
          initialFormData={{}}
          onSubmit={onRoyaltiesFormSubmit}
        />
      </CollectionEditFormWrapper>
    </CollectionEditContentWrapper>
  </CollectionEditPaper>);
};

const CollectionEditPaper = styled(PagePaper)`
  padding: 0;
  border-radius: 8px;
`;

const CollectionEditContentWrapper = styled.div`
  display: flex;
  gap: calc(var(--gap) * 2);
  padding: 0 calc(var(--gap) * 2);
  @media (max-width: 1024px) {
    padding: 0;
  }
`;

const CollectionEditFormWrapper = styled.div`
  padding: calc(var(--gap) * 1.5) 0;
  @media (max-width: 1024px) {
    flex: 1;
  }
`;
