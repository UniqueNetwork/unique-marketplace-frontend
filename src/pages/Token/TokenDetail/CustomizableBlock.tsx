import React, { useEffect, useMemo, useState } from 'react';
import { CollectionWithInfoV2Dto, TokenByIdResponse } from '@unique-nft/sdk';
import styled from 'styled-components';

import { Offer } from 'api/restApi/offers/types';
import { GQLCollection } from 'api/scanApi/types';
import { Loader, Text } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';
import { Link } from 'react-router-dom';
import { mockWearables } from '../constants';

type CustomizableBlockProps = {
  token?: TokenByIdResponse
  collection?: CollectionWithInfoV2Dto
  offer?: Offer
}

export const CustomizableBlock = ({ token, offer, collection }: CustomizableBlockProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [baseCollection, setBaseCollection] = useState<GQLCollection>();
  const [wearableCollections, setWearableCollections] = useState<GQLCollection[]>([]);
  const { getCollection } = useCollections();
  const { currentChainId } = useApi();
  const { collectionId } = useMemo(() => {
    const { collectionId } = offer || token || {};
    return {
      collectionId
    };
  }, [token, collection, offer]);

  const isCustomizable = useMemo(() => {
    return !!collection?.properties.find(({ key }) => key === 'is_customizable')?.value;
  }, [collection]);

  const wearable = useMemo(() => {
    return mockWearables[currentChainId || '']?.find((item) => collectionId === item.collectionId);
  }, [collectionId, currentChainId]);

  useEffect(() => {
    if (!isCustomizable && !wearable) return;

    void (async () => {
      setIsLoading(true);
      if (isCustomizable) {
        const ids = collection?.permissions?.nesting?.restricted;
        if (!ids?.length) return;
        const collections = (await Promise.all(ids.map(getCollection))).filter((collection) => !!collection) as GQLCollection[];
        setWearableCollections(collections);
      }
      if (wearable) {
        const collection = await getCollection(wearable.baseCollections[0]);
        setBaseCollection(collection);
      }
      setIsLoading(false);
    })();
  }, [isCustomizable, wearable, collection]);

  if (!isCustomizable && !wearable) return null;

  if (isLoading) return <Loader />;

  return <CustomizableWrapper>
    <Row>
      <Text color='grey-500'>Type:</Text>
      <Text>{isCustomizable ? 'Base NFT' : 'NFT Wearables'}</Text>
    </Row>
    <Row>
      <Text color='grey-500'>{isCustomizable ? 'Wearables collections:' : 'Base collection:'}</Text>
      {isCustomizable && wearableCollections.length > 0 && wearableCollections.map(({ id, name }) => {
        return <Link to={`/${currentChainId}/collection/${id}`}>{name}</Link>;
      })}
      {!!wearable && !!baseCollection && <Link to={`/${currentChainId}/collection/${baseCollection.id}`}>{baseCollection.name}</Link> }
    </Row>
  </CustomizableWrapper>;
};

const CustomizableWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &>div {
    gap: 8px;
  }
`;

const Row = styled.div`
  & > * {
    display: inline-block;
  }
  & > span:first-child {
    margin-right: 8px;
  }
  &>a {
    font-size: 16px;
  }
`;
