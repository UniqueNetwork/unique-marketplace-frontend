import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { PagePaper } from 'components/PagePaper/PagePaper';
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
import { Icon, Modal } from 'components/UI';
import { SaveCollectionStagesModal } from './Modals/SaveCollectionModal';
import { BlueGrey500 } from 'styles/colors';
import { SetRoyaltiesStagesModal } from './Modals/SetRoyaltiesModal';
import { RoyaltiesFormData } from './types';
import { Sponsorship } from './Forms/Sponsorship';
import { Limits } from './Forms/Limits';
import { BurningPermission } from './Forms/BurningPermission';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

export const CollectionEditPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<MarketableCollection | null>(null);
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [isFetchingCollection, setIsFetchingCollection] = useState<boolean>(true);
  const { fetchCollection } = useMarketableCollection();
  const { api, currentChainId } = useApi();
  const [banner, setBanner] = useState<{src: string, file?: Blob}>();
  const [cover, setCover] = useState<{src: string, file?: Blob}>();
  const [metadata, setMetadata] = useState<MarketableCollectionMetadata>({});
  const [royalty, setRoyalty] = useState<RoyaltiesFormData>({ royalties: [] });
  const [modalType, setModalType] = useState<'metadata' | 'royalty'>();
  const navigate = useNavigate();

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

      const collectionOnChain = await api?.collection?.getCollection(Number(collectionId));
      setCollectionInfo(collectionOnChain || null);
      if (collectionOnChain?.schema?.royalties?.length) {
        setRoyalty({
          royalties: collectionOnChain?.schema?.royalties.map((royalty) => {
            const value = royalty.value
              ? (Number(royalty.value) / 100).toFixed(2)
              : '0';
            const address = royalty.address;
            return ({ value, address });
          })
        });
      }

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
    setMetadata({ ...metadata, banner: banner?.src, cover: cover?.src });
    setModalType('metadata');
  }, [banner, cover]);

  const onRoyaltiesFormSubmit = useCallback((royalty: RoyaltiesFormData) => {
    setRoyalty(royalty);
    setModalType('royalty');
  }, []);

  const onUpdateFinish = useCallback(async () => {
    setModalType(undefined);
    const collection = await fetchCollection(Number(collectionId));
      setCollection(collection || null);
      collection?.metadata?.banner && setBanner({ src: collection?.metadata?.banner });
      setCover({ src: collection?.metadata?.cover || collection?.data?.schema?.coverPicture.fullUrl || '' });

      setMetadata({
        ...(collection?.metadata || {}),
        description: collection?.metadata?.description || collection?.description
      });
  }, [collectionId, fetchCollection]);

  const isCollectionChanged = useMemo(() => {
    const coverNotChanged = (cover?.src === collection?.data?.schema?.coverPicture.fullUrl && !collection?.metadata?.cover) || collection?.metadata?.cover === cover?.src;
    return collection?.metadata?.banner !== banner?.src || !coverNotChanged;
  }, [collection, banner, cover]);

  const backClickHandler = useCallback(() => {
    if (history.length > 2) {
      history.back();
    } else {
      navigate(`/${currentChainId || ''}/collection/${collectionId || ''}`);
    }
  }, [navigate, currentChainId, collectionId]);

  const onComplete = useCallback(async () => {
    setIsFetchingCollection(true);
    const collection = await fetchCollection(Number(collectionId));
    setCollection(collection || null);
    setIsFetchingCollection(false);
    setModalType(undefined);
  }, [fetchCollection]);

  if (isFetchingCollection) {
    return <CollectionEditPaper>
      <CollectionEditSkeleton />
    </CollectionEditPaper>;
  }

  if (!collection || !collectionInfo) return <Error404 />;

  return (<>
    <BackLink onClick={backClickHandler}>
      <Icon name='arrow-left' color={BlueGrey500} size={16}/>
      <p>back</p>
    </BackLink>
    <CollectionEditPaper>
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
            isCoverChanged={isCollectionChanged}
          />
          <RoyaltiesForm
            initialFormData={royalty}
            onSubmit={onRoyaltiesFormSubmit}
          />
          <Sponsorship collection={collection} collectionInfo={collectionInfo} onComplete={onComplete} />
          <Limits collection={collection} collectionInfo={collectionInfo} onComplete={onComplete} />
          <BurningPermission collection={collection} collectionInfo={collectionInfo} onComplete={onComplete} />
        </CollectionEditFormWrapper>
      </CollectionEditContentWrapper>
      <Modal isVisible={modalType === 'metadata'}>
        <SaveCollectionStagesModal
          metadata={metadata}
          bannerFile={banner?.file}
          coverFile={cover?.file}
          onFinish={onUpdateFinish}
          collectionId={collection.collectionId}
        />
      </Modal>
      <Modal isVisible={modalType === 'royalty'}>
        <SetRoyaltiesStagesModal
          formData={royalty}
          onFinish={onUpdateFinish}
          collectionId={collection.collectionId}
        />
      </Modal>
    </CollectionEditPaper>
  </>);
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

const BackLink = styled.button`
  text-decoration: none;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  font-family: var(--font-inter);
  line-height: 24px;
  color: ${BlueGrey500};
  display: flex;
  gap: 6px;
  width: 60px;
  border: none;
  background: none;
  cursor: pointer;
  p {
    transform: translateY(-3px);
  }
  svg {
    width: 14px;
  }
`;
