import React, { FC, useEffect, useMemo, useState } from 'react';
import { Dropdown, Icon, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { CollectionData } from 'api/restApi/admin/types';
import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import { NFTCollection } from 'api/uniqueSdk/types';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { shortcutText } from 'utils/textUtils';
import { Picture } from '..';
import { AdditionalDark, AdditionalLight } from 'styles/colors';

export type TCollectionCard = {
  collection: CollectionData
  onManageTokensClick(): void
  onManageSponsorshipClick(): void
  onRemoveSponsorshipClick(): void
  onRemoveCollectionClick(): void
  onViewOnScanClick(): void
};

export const CollectionCard: FC<TCollectionCard> = ({
  collection,
  onManageSponsorshipClick,
  onRemoveSponsorshipClick,
  onManageTokensClick,
  onRemoveCollectionClick,
  onViewOnScanClick
}) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const collectionApi = api?.collection;
  const [collectionDetails, setCollectionDetails] = useState<NFTCollection | null>();
  useEffect(() => {
    if (!collection?.id) return;
    (async () => {
      setCollectionDetails(await collectionApi?.getCollection(collection.id));
    })();
  }, [collection, collectionApi]);

  const canConfirmSponsorships = useMemo(() => {
    return selectedAccount?.address &&
      collectionDetails?.sponsorship?.address &&
      !collectionDetails?.sponsorship?.isConfirmed &&
      compareEncodedAddresses(selectedAccount.address, collectionDetails.sponsorship.address);
  }, [selectedAccount?.address, collectionDetails?.sponsorship?.isConfirmed, collectionDetails?.sponsorship?.address]);

  const canRemoveSponsorships = useMemo(() => {
    return selectedAccount?.address &&
      collectionDetails?.sponsorship?.address &&
      collectionDetails?.sponsorship?.isConfirmed &&
      (compareEncodedAddresses(selectedAccount.address, collectionDetails.sponsorship.address) ||
        compareEncodedAddresses(selectedAccount.address, collection?.owner || ''));
  }, [selectedAccount?.address, collectionDetails?.sponsorship?.isConfirmed, collectionDetails?.sponsorship?.address, collection?.owner]);

  const hasSponsorship = useMemo(() => collectionDetails?.sponsorship && collectionDetails?.sponsorship?.isConfirmed, [collectionDetails]);
  const hasUnconfirmedSponsorship = useMemo(() => !collectionDetails?.sponsorship?.isConfirmed, [collectionDetails]);

  return (
    <CollectionCardStyled>
      <PictureWrapper>
        <Picture alt={collection?.id?.toString() || ''} src={collection.coverImageUrl || collectionDetails?.coverImageUrl} />
        <ActionsMenuWrapper>
          <Dropdown placement={'right'}
            dropdownRender={() => (<DropdownMenu>
              {canConfirmSponsorships && <DropdownMenuItem onClick={onManageSponsorshipClick}>Manage sponsorship</DropdownMenuItem>}
              {/* TODO: wait until the network can grant access to remove sponsorship */}
              {/* canRemoveSponsorships && <DropdownMenuItem onClick={onRemoveSponsorshipClick}>Remove sponsorship</DropdownMenuItem> */}
              <DropdownMenuItem onClick={onManageTokensClick}>Manage tokens</DropdownMenuItem>
              <DropdownMenuItem onClick={onRemoveCollectionClick}>Remove collection</DropdownMenuItem>
              <DropdownMenuItem onClick={onViewOnScanClick}>View on Scan
                <IconWrapper>
                  <Icon name={'arrow-up-right'} size={16} color={'var(--color-primary-500)'} />
                </IconWrapper>
              </DropdownMenuItem>
            </DropdownMenu>)}
          >
            <DropdownWrapper>
              <Icon name='more-horiz' size={24} color='var(--color-additional-light)' />
            </DropdownWrapper>
          </Dropdown>
        </ActionsMenuWrapper>
      </PictureWrapper>
      <Description>
        <Text size='l' weight='regular' color={'secondary-500'}>
          {`${collection.name || collection.collectionName || ''} [id ${collection?.id}]`}
        </Text>
        <AttributesWrapper>
          <Row>
            <Text size='s' color={'grey-500'} >Allowed tokens:</Text>
            <Text size='s' >{collection.allowedTokens || 'all'}</Text>
          </Row>
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
