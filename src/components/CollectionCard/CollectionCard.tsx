import React, { FC } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Picture } from '..';
import { NFTCollection } from '../../api/chainApi/unique/types';
import { DropdownMenu, DropdownMenuItem } from '../DropdownMenu/DropdownMenu';
import { AdditionalDark, AdditionalLight } from '../../styles/colors';
import { Icon } from '../Icon/Icon';
import ArrowUpRight from '../../static/icons/arrow-up-right.svg';

export type TCollectionCard = {
  collection: Pick<NFTCollection, 'id' | 'collectionName' | 'coverImageUrl' >
  onManageSponsorshipClick(): void
  onRemoveSponsorshipClick(): void
  onRemoveCollectionClick(): void
};

export const CollectionCard: FC<TCollectionCard> = ({ collection, onManageSponsorshipClick, onRemoveCollectionClick, onRemoveSponsorshipClick }) => {
  return (
    <CollectionCardStyled>
      <PictureWrapper>
        <Picture alt={collection?.id?.toString() || ''} src={collection.coverImageUrl} />
        <ActionsMenuWrapper>
          <DropdownMenu title={'...'} >
            <DropdownMenuItem onClick={onManageSponsorshipClick}>Manage sponsorship</DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveSponsorshipClick}>Remove sponsorship</DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveCollectionClick}>Remove collection</DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveCollectionClick}>View on Scan

              <IconWrapper>
                <Icon path={ArrowUpRight} />
              </IconWrapper>
            </DropdownMenuItem>
          </DropdownMenu>
        </ActionsMenuWrapper>
      </PictureWrapper>
      <Description>
        <Text size='l' weight='medium' color={'secondary-500'}>
          {`${collection.collectionName || ''} [id ${collection?.id}]`}
        </Text>
        <AttributesWrapper>
          <Row>
            <Text size='s' color={'grey-500'} >Items:</Text>
            <Text size='s' >{'0'}</Text>
          </Row>
          <Row>
            <Text size='s' color={'grey-500'} >Sponsor:</Text>
            <Text size='s' >{'not assigned'}</Text>
          </Row>
        </AttributesWrapper>

      </Description>
    </CollectionCardStyled>
  );
};

const CollectionCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
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

    img {
      max-width: 100%;
      max-height: 100%;
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
