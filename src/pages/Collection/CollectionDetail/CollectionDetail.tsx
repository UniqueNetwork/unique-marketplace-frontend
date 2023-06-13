import React, { FC, useMemo } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import styled from 'styled-components';

import { Picture, Avatar } from 'components';
import { CollapsableText, Icon, Text, Link as UILink } from 'components/UI';
import { isTokenOwner, toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { CollectionStatisticsBlock } from './CollectionStaticticsBlock';
import { CollectionDetailSkeleton } from './CollectionDetailSkeleton';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { shortcutText } from 'utils/textUtils';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { Primary500, Primary600 } from 'styles/colors';
import CollectionBanner from 'static/images/banner.svg';
import config from 'config';
import { PagePaper } from 'components/PagePaper/PagePaper';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { Link } from 'react-router-dom';
import { MarketableCollection } from 'api/restApi/collections/types';
interface IProps {
  collection?: MarketableCollection
}

export const CollectionDetail: FC<IProps> = ({ collection }) => {
  const { selectedAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const { currentChainId, chainProperties } = useApi();

  const { name, description, data, owner, collectionId } = collection || {};
  const { schema } = data || {};

  const formatedAddressOwner = useMemo(() => {
    if (!owner) return '';
    return toChainFormatAddress(owner, chainProperties?.SS58Prefix || 0);
  }, [owner, chainProperties?.SS58Prefix]);

  const isOwner = useMemo(() => {
    if (!selectedAccount) return false;
    return isTokenOwner(selectedAccount?.address, owner || '');
  }, [owner, selectedAccount]);

  if (!collection) {
    return <CollectionDetailPaper>
      <CollectionDetailWrapper>
        <CollectionDetailSkeleton />
      </CollectionDetailWrapper>
    </CollectionDetailPaper>;
  }

  const scanUrl = currentChainId ? config.blockchains[currentChainId]?.scanUrl : '';

  return <CollectionDetailPaper>
    <BannerWrapper >
      <img src={CollectionBanner} />
    </BannerWrapper>
    <CollectionDetailWrapper>
      <CollectionCardWrapper >
        <PictureWrapper>
          <Picture alt={name || ''} src={schema?.coverPicture.fullUrl || ''} size={160} />
        </PictureWrapper>
        <CollectionInfoWrapper>
          <div>
            <Heading size='1' >{name}</Heading>
            <Row>
              <CollapsableText size='l' >{description}</CollapsableText>
            </Row>
          </div>
          {deviceSize < DeviceSize.lg && <>
            {isOwner && <Row>
              <EditCollectionLink to={`/collection/${collectionId}/edit`}>
                <span>Edit collection</span>
                <Icon size={24} name={'gear'} />
              </EditCollectionLink>
            </Row>}
            <Row>
              <LinksWrapper>
                <Icon size={24} name={'discord'} />
                <Icon size={24} name={'instagram'} />
                <Icon size={24} name={'twitter'} />
                <Icon size={24} name={'globe-simple'} />
                <Icon size={24} name={'shared'} />
              </LinksWrapper>
            </Row>
          </>}
          <Row>
            <Text color='grey-500' size='m'>ID:</Text>
            <Text size='m'>{collectionId}</Text>
            <OwnerWrapper>
              {isOwner && <Text color='grey-500' size='m'>You own it</Text>}
              {!isOwner && <>
                <Text color='grey-500' size='m'>
                  Owner:
                </Text>
                <AccountLink href={`${config.blockchains[currentChainId || '']?.scanUrl}account/${formatedAddressOwner || '404'}`}>
                  <Avatar size={24} src={DefaultAvatar} address={formatedAddressOwner}/>
                  <Text color='primary-600' size='m' >
                    {shortcutText(formatedAddressOwner || '')}
                  </Text>
                </AccountLink>
              </>}
            </OwnerWrapper>
          </Row>
          <CollectionStatisticsBlock collection={collection} />
          {deviceSize < DeviceSize.lg && <CreationInfoWrapper>
            <Text color={'grey-500'} >Created on {'15 February 2021'}</Text>
            <LinkStyled
              target={'_blank'}
              rel={'noreferrer'}
              href={`${scanUrl}collection/${collection.id}`}
            >
              <TextStyled>View on UniqueScan</TextStyled>
              <IconWrapper>
                <Icon name={'arrow-up-right'} size={16} color={Primary500} />
              </IconWrapper>
            </LinkStyled>
          </CreationInfoWrapper>}
        </CollectionInfoWrapper>
      </CollectionCardWrapper>
      {deviceSize >= DeviceSize.lg && <RightSidebar>
        {isOwner && <EditCollectionLink to={`/collection/${collection.id}/edit`}>
          {/* TODO: use link from react-router-dom instead of href to avoid page refresh */}
          <span>Edit collection</span>
          <Icon size={24} name={'gear'} />
        </EditCollectionLink>}
        <LinksWrapper>
          <Icon size={24} name={'discord'} />
          <Icon size={24} name={'instagram'} />
          <Icon size={24} name={'twitter'} />
          <Icon size={24} name={'globe-simple'} />
          <Icon size={24} name={'shared'} />
        </LinksWrapper>
        <CreationInfoWrapper>
          <Text color={'grey-500'} >Created on {'15 February 2021'}</Text>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`${scanUrl}collections/${collection.id}`}
          >
            <TextStyled>View on UniqueScan</TextStyled>
            <IconWrapper>
              <Icon name={'arrow-up-right'} size={16} color={Primary500} />
            </IconWrapper>
          </LinkStyled>
        </CreationInfoWrapper>
      </RightSidebar>}
    </CollectionDetailWrapper>
  </CollectionDetailPaper>;
};

const CollectionDetailPaper = styled(PagePaper)`
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
  
`;

const BannerWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const CollectionDetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: calc(var(--gap) * 1.5) calc(var(--gap) * 2) calc(var(--gap) * 2);
  position: relative;
  @media (max-width: 768px) {
    padding: calc(var(--gap) * 1.5) 0 calc(var(--gap) * 2);
  }
`;

const CollectionCardWrapper = styled.div`
  display: flex;
  gap: calc(var(--gap) * 2);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PictureWrapper = styled.div`
  margin-top: -104px;
  overflow: hidden;
  border-radius: 24px;
  border: 4px solid var(--color-additional-light);
  background: var(--color-additional-light);
  width: 160px;
  height: 160px;  
  .picture {
    display: inline;
  }
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  @media (max-width: 768px) {
    margin-left: calc(var(--gap) * 2);
  }
`;

const CollectionInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  h1.unique-font-heading.size-1 {
    margin-bottom: var(--gap);
  }
`;

const OwnerWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: calc(var(--gap) / 2);
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--gap) / 2);
`;

const EditCollectionLink = styled(Link)`
  display: flex;
  gap: var(--gap);
  align-items: center;
  text-align: center;
  margin-bottom: calc(var(--gap) * 1.5);
  color: ${Primary500};
  font-size: 16px;
`;

const LinksWrapper = styled.div`
  display: flex;
  gap: var(--gap);
  justify-content: flex-end;
  margin-bottom: calc(var(--gap) * 1.5);
  flex-wrap: wrap;
`;

const CreationInfoWrapper = styled.div`
  margin-top: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: calc(var(--gap) / 2);
`;

const AccountLink = styled.a`
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  color: ${Primary600};
  
  span {
    margin-left: 8px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LinkStyled = styled(UILink)`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
  width: fit-content;
  margin-top: calc(var(--gap) / 2);
`;

const TextStyled = styled(Text)`
  && {
    color: var(--color-primary-500);
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
