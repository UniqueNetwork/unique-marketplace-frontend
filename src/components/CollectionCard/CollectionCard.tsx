import React, { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { ExternalLink } from 'components/UI';
import { MyCollection } from 'api/restApi/collections/types';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import { Picture } from '..';
import { AdditionalDark, AdditionalLight } from 'styles/colors';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { getIpfsUriByImagePath } from 'utils/urlUtils';

export type TCollectionCard = {
  collection: MyCollection

  onViewOnScanClick(): void
};

export const CollectionCard: FC<TCollectionCard> = ({
  collection,
  onViewOnScanClick
}) => {
  const { featuredCollections } = useApi();
  const [collectionDetails, setCollectionDetails] = useState<CollectionInfoWithSchemaResponse | null>();
  useEffect(() => {
    if (!collection?.id) return;
    setCollectionDetails(featuredCollections[collection.id]?.description);
  }, [collection, featuredCollections]);

  const hasSponsorship = useMemo(() => collectionDetails?.sponsorship && collectionDetails?.sponsorship?.isConfirmed, [collectionDetails]);
  const hasUnconfirmedSponsorship = useMemo(() => collectionDetails?.sponsorship && !collectionDetails?.sponsorship?.isConfirmed, [collectionDetails]);

  return (
    <CollectionCardStyled>
      <PictureWrapper>
        <Link to={`/collection/${collection?.id}`}>
          <Picture alt={collection?.id?.toString() || ''} src={getIpfsUriByImagePath(collection.cover || '')} />
        </Link>
      </PictureWrapper>
      <Description>
        <Text size='l' weight='regular'>
          <ExternalLink onClick={onViewOnScanClick}>
            {`${collection.name || ''} [id ${collection?.id}]`}

          </ExternalLink>
        </Text>
        <AttributesWrapper>
          {hasSponsorship && <Row>
            <Text size='s' color={'grey-500'} >Sponsor:</Text>
            <Text size='s' >{collectionDetails?.sponsorship?.isConfirmed ? shortcutText(collectionDetails?.sponsorship?.address || '') : 'not assigned'}</Text>
          </Row>}
          {hasUnconfirmedSponsorship && <Row>
            <Text size='s' color={'coral-500'} >Waiting for sponsorship approval</Text>
          </Row>}
        </AttributesWrapper>
      </Description>
    </CollectionCardStyled>
  );
};

const CollectionCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  cursor: pointer;
`;

const PictureWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;
    transition: 50ms;
    overflow: hidden;
    
    img {    
      object-fit: cover;
      height: 100%;
    }

    svg {
      border-radius: 8px;
    }
  }
`;

const ActionsMenuWrapper = styled.div`
  position: absolute;
  top: calc(var(--gap) / 2);
  right: calc(var(--gap) / 2);
  
  div[class*=DropdownMenuButtonWrapper] {
    & > button {
      padding: 4px;
      background-color: ${AdditionalDark};
      border: 2px solid #FFFFFF;
      border-radius: 4px;
      color: ${AdditionalLight};
      height: 32px;
      &:hover {
        background-color: ${AdditionalDark};
      }
    }
    & > img {
      display: none;
    }
  }
  div[class*=DropdownMenuDropdown] {
    width: max-content;
    & > div {
      padding: calc(var(--gap) / 2) var(--gap);
      display: flex;
    }
  }
  
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
`;

const AttributesWrapper = styled.div` 
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
`;

const Row = styled.div` 
  && {
    display: flex;
    align-items: center;
    column-gap: calc(var(--gap) / 4);
  }
`;

const IconWrapper = styled.div`
  && {
    width: 16px;
    height: 16px;
    color: var(--color-primary-500);
    padding: 0;

    path {
      stroke: currentColor;
    }
  }
`;

const DropdownWrapper = styled.div`
  background: var(--color-additional-dark);
  border-radius: 4px;
  padding: calc(var(--gap) / 4) calc(var(--gap) / 4) 0 calc(var(--gap) / 4);
`;

const DropdownMenu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const DropdownMenuItem = styled.div`
  display: flex;
  padding: var(--gap);
  cursor: pointer;
  &:hover {
    background: var(--color-primary-100);
    color: var(--color-primary-500);
  }
`;
