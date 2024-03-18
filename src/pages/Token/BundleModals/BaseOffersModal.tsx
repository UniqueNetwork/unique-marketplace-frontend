import { Button, Heading, Loader, Text } from '@unique-nft/ui-kit';
import { useOffers } from 'api/restApi/offers/offers';
import { OfferCard } from 'components/OfferCard/OfferCard';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';
import { useIsFirstRender } from 'hooks/useIsFirstRender';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { mockWearables } from '../constants';
import { TBundleTransferModalBodyProps } from './BundleTransferModal';
import { GQLCollection } from 'api/scanApi/types';

export const BaseOffersModal = ({
  token,
  onFinish
}: TBundleTransferModalBodyProps) => {
  const [collection, setCollection] = useState<GQLCollection>();
  const { currentChainId } = useApi();
  const { offers, isFetching, fetch } = useOffers();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCollection } = useCollections();

  useEffect(() => {
    void (async () => {
      if (!currentChainId) return;
      const baseCollectionIds = mockWearables[currentChainId].find(({ collectionId }) => collectionId === token.collectionId)?.baseCollections || [];
      if (!baseCollectionIds.length) return;
      const baseCollection = await getCollection(baseCollectionIds[0]);
      if (!baseCollection) return;
      setCollection(baseCollection);
      await fetch({
        pageSize: 8,
        page: 1,
        collectionId: [baseCollectionIds[0]]
      });
    })();
  }, [token, currentChainId, fetch]);

  const onExploreCollectionClick = useCallback(() => {
    if (!currentChainId) return;
    const baseCollectionIds = mockWearables[currentChainId].find(({ collectionId }) => collectionId === token.collectionId)?.baseCollections || [];
    navigate(`/${currentChainId}/collection/${baseCollectionIds[0]}?filterState=%7B%22statuses%22%3A%7B%22fixedPrice%22%3Atrue%7D%7D`);
  }, [token, currentChainId]);

  const isFirtstRender = useIsFirstRender();
  useEffect(() => {
    if (isFirtstRender) return;
    onFinish();
  }, [location.pathname]);

  useEffect(() => {
    if (isFirtstRender) return;
    if (!isFetching && offers.length === 0) {
      if (!currentChainId) return;
      const baseCollectionIds = mockWearables[currentChainId].find(({ collectionId }) => collectionId === token.collectionId)?.baseCollections || [];
      navigate(`/${currentChainId}/collection/${baseCollectionIds[0]}?filterState=%7B%22statuses%22%3A%7B%22fixedPrice%22%3Atrue%7D%7D`);
    }
  }, [offers, token, isFetching, currentChainId]);

  return <>
    <Content>
      <Heading size='2'>Select base NFT</Heading>
    </Content>
    <CreateBundleModalWrapper>
      <Text>You don’t have a Base NFT from {collection?.name} collection. Buy one on our Marketplace and equip your wearable.</Text>
      <EquipsSection>
        <EquipsListWrapper>
          {offers.map((offer) => <OfferCard
            testid={''}
            key={`${token?.tokenId}_${token?.collectionId}`}
            offer={offer}
          />)}
        </EquipsListWrapper>
      </EquipsSection>
      <ActionsWrapper>
        <Button role='primary'
          size='middle'
          title='Explore all Base NFTs'
          onClick={onExploreCollectionClick}
        />
        <Button role='outlined'
          size='middle'
          title='Cancel'
          onClick={onFinish}
        />
      </ActionsWrapper>
      {isFetching && <LoaderWrapper><Loader /></LoaderWrapper>}
    </CreateBundleModalWrapper>
  </>;
};
const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;

const CreateBundleModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
`;

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--gap);
  justify-content: flex-end;
  align-items: center;
  &>div {
    margin: 0;
  } 
  button {
    min-width: 140px;
  }
`;

const EquipsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
`;

const EquipsListWrapper = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
  height: 100%;
  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    min-width: auto;
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
    width: auto;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    width: auto;
  }
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.7);
`;
