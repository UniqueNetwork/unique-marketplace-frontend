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
import { useMarketableCollection } from 'api/restApi/collections/collection';
import { MarketableCollection, MarketableCollectionMetadata } from 'api/restApi/collections/types';
import { Modal } from 'components/UI';
import { SaveCollectionStagesModal } from './Modals/SaveCollectionModal';

export const CollectionEditPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<MarketableCollection | null>(null);
  const [isFetchingCollection, setIsFetchingCollection] = useState<boolean>(true);
  const { fetchCollection } = useMarketableCollection();
  const { api } = useApi();
  const [banner, setBanner] = useState<{src: string, file?: Blob}>();
  const [cover, setCover] = useState<{src: string, file?: Blob}>();
  const [metadata, setMetadata] = useState<MarketableCollectionMetadata>({});
  const [saveCollectionModalIsVisible, setSaveCollectionModalIsVisible] = useState(false);

  useEffect(() => {
    if (!api?.collection) return;

    setIsFetchingCollection(true);
    void (async () => {
      const collection = await fetchCollection(Number(collectionId));
      setCollection(collection || null);
      collection?.metadata?.banner && setBanner({ src: collection?.metadata?.banner });
      setCover({ src: collection?.metadata?.cover || collection?.data?.schema?.coverPicture.fullUrl || '' });

      setMetadata({
        ...(collection?.metadata || {}),
        description: collection?.metadata?.description || collection?.description
      });
      setIsFetchingCollection(false);
    })();
  }, [api, collectionId, setIsFetchingCollection, fetchCollection]);

  const { name } = collection || {};

  const onUploadBanner = useCallback((src: string, file: Blob) => {
    setBanner({ src, file });
  }, []);

  const onRemoveBanner = useCallback(() => {
    setBanner(undefined);
  }, []);

  const onUploadCover = useCallback((src: string, file: Blob) => {
    setCover({ src, file });
  }, []);

  const onRemoveCover = useCallback(() => {
    setCover(undefined);
  }, []);

  const onCollectionEditFormSubmit = useCallback((metadata: MarketableCollectionMetadata) => {
    setMetadata(metadata);
    setSaveCollectionModalIsVisible(true);
  }, []);

  const onRoyaltiesFormSubmit = useCallback(() => {
    throw new Error('Not implemented');
  }, []);

  const onUpdateFinish = useCallback(async () => {
    setSaveCollectionModalIsVisible(false);
    const collection = await fetchCollection(Number(collectionId));
      setCollection(collection || null);
      collection?.metadata?.banner && setBanner({ src: collection?.metadata?.banner });
      setCover({ src: collection?.metadata?.cover || collection?.data?.schema?.coverPicture.fullUrl || '' });

      setMetadata({
        ...(collection?.metadata || {}),
        description: collection?.description
      });
  }, []);

  if (isFetchingCollection) {
    return <CollectionEditPaper>
      <CollectionEditSkeleton />
    </CollectionEditPaper>;
  }

  if (!collection) return <Error404 />;

  return (<CollectionEditPaper>
    <CollectionBannerComponent
      src={banner?.src}
      onChange={onUploadBanner}
      onRemove={onRemoveBanner}
    />
    <CollectionEditContentWrapper>
      <CollectionCover
        name={name || ''}
        src={cover?.src}
        onChange={onUploadCover}
        onRemove={onRemoveCover}
      />
      <CollectionEditFormWrapper>
        <Heading size='1' >{name}</Heading>
        <CollectionEditForm
          initialFormData={metadata}
          onSubmit={onCollectionEditFormSubmit}
        />
        {/* <RoyaltiesForm
          initialFormData={{}}
          onSubmit={onRoyaltiesFormSubmit}
        /> */}
      </CollectionEditFormWrapper>
    </CollectionEditContentWrapper>
    <Modal isVisible={saveCollectionModalIsVisible}>
      <SaveCollectionStagesModal
        metadata={metadata}
        bannerFile={banner?.file}
        coverFile={cover?.file}
        onFinish={onUpdateFinish}
        collectionId={collection.collectionId}
      />
    </Modal>
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
  @media (max-width: 768px) {
    padding: 0;
    flex-direction: column;
  }
`;

const CollectionEditFormWrapper = styled.div`
  padding: calc(var(--gap) * 1.5) 0;
  flex: 1;
  @media (max-width: 1024px) {
    flex: 1;
  }
`;
