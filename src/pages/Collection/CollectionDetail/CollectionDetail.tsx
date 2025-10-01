import React, { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Address } from '@unique-nft/utils';
import styled from 'styled-components';

import { Picture, Avatar } from 'components';
import { CollapsableText, Icon, Text, Link as UILink, Heading } from 'components/UI';
import { isTokenOwner, toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { CollectionStatisticsBlock } from './CollectionStaticticsBlock';
import { CollectionDetailSkeleton } from './CollectionDetailSkeleton';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { shortcutText } from 'utils/textUtils';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { Primary500, Primary600 } from 'styles/colors';
import { PagePaper } from 'components/PagePaper/PagePaper';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { MarketableCollection } from 'api/restApi/collections/types';
import ShareTokenModal from 'pages/Token/TokenDetail/ShareTokenModal';
import { RoyaltiesFormData } from 'pages/CollectionEdit/types';
import { dateFormat } from 'utils/timestampUtils';
import config from 'config';
import { getIpfsUriByImagePath } from 'utils/urlUtils';

interface IProps {
  collection?: MarketableCollection
  royalties?: RoyaltiesFormData
}

export const CollectionDetail: FC<IProps> = ({ collection, royalties }) => {
  const { selectedAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const { currentChainId, chainProperties } = useApi();

  const { name, description, data, owner, collectionId, metadata, cover } = collection || {};

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const formatedAddressOwner = useMemo(() => {
    if (!owner) return '';
    return toChainFormatAddress(owner, chainProperties?.SS58Prefix || 0);
  }, [owner, chainProperties?.SS58Prefix]);

  const isOwner = useMemo(() => {
    if (!selectedAccount) return false;
    if (selectedAccount.name === 'Metamask Account') {
      return isTokenOwner(Address.mirror.ethereumToSubstrate(selectedAccount.address, chainProperties?.SS58Prefix), owner || '');
    }
    return isTokenOwner(selectedAccount?.address, owner || '');
  }, [owner, selectedAccount]);

  const externalLinks = useMemo(() => {
    const { metadata } = collection || {};
    const hasAnyLink = !!metadata?.discord ||
      !!metadata?.instagram ||
      !!metadata?.twitter ||
      !!metadata?.telegram ||
      !!metadata?.reddit ||
      !!metadata?.website;
    return (<>
      {metadata?.discord && <UILink href={metadata?.discord} ><Icon size={24} name={'discord'}/></UILink>}
      {metadata?.instagram && <UILink href={metadata?.instagram} ><Icon size={24} name={'instagram'}/></UILink>}
      {metadata?.twitter && <UILink href={metadata?.twitter} ><Icon size={24} name={'twitter'}/></UILink>}
      {metadata?.telegram && <UILink href={metadata?.telegram} ><Icon size={24} name={'telegram'}/></UILink>}
      {metadata?.reddit && <UILink href={metadata?.reddit} ><Icon size={24} name={'reddit'}/></UILink>}
      {metadata?.website && <UILink href={metadata?.website} ><Icon size={24} name={'globe-simple'}/></UILink>}
      {hasAnyLink && <Separator/>}
      <ShareLink><Icon size={24} name={'shared'} onClick={() => setIsShareModalVisible(true)}/></ShareLink>
    </>);
  }, [collection]);

  if (!collection) {
    return <CollectionDetailPaper>
      <CollectionDetailWrapper>
        <CollectionDetailSkeleton />
      </CollectionDetailWrapper>
    </CollectionDetailPaper>;
  }


  return <CollectionDetailPaper>
    <BannerWrapper >
      {!!collection.metadata?.banner && <img src={collection.metadata.banner} />}
    </BannerWrapper>
    <CollectionDetailWrapper>
      <CollectionCardWrapper >
        <PictureWrapper>
          <Picture alt={name || ''} src={getIpfsUriByImagePath(cover)} size={160} />
        </PictureWrapper>
        <CollectionInfoWrapper>
          <div>
            <Heading size='1' >{name}</Heading>
            <Row>
              <CollapsableText size='l' >{metadata?.description || description}</CollapsableText>
            </Row>
          </div>
          {deviceSize < DeviceSize.xl && <>
            {isOwner && <Row>
              <EditCollectionLink to={`/collection/${collectionId}/edit`}>
                <span>Edit collection</span>
                <Icon size={24} name={'gear'} />
              </EditCollectionLink>
            </Row>}
            <Row>
              <LinksWrapper>
                {externalLinks}
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
                <AccountLink target='_blank' href={`${config.blockchains[currentChainId || '']?.scanUrl}account/${formatedAddressOwner || '404'}`}>
                  <Avatar size={24} src={DefaultAvatar} address={formatedAddressOwner}/>
                  <Text color='primary-600' size='m' >
                    {shortcutText(formatedAddressOwner || '')}
                  </Text>
                </AccountLink>
              </>}
            </OwnerWrapper>
          </Row>
          <CollectionStatisticsBlock collection={collection} royalties={royalties} />
          {deviceSize < DeviceSize.xl && <CreationInfoWrapper>
            <Text color={'grey-500'} >Created on {collection.createdAt}</Text>
            <LinkStyled
              target={'_blank'}
              rel={'noreferrer'}
              href={`https://unique.subscan.io/unique_collection/${collectionId}`}
            >
              <TextStyled>View on SubScan</TextStyled>
              <IconWrapper>
                <Icon name={'arrow-up-right'} size={16} color={Primary500} />
              </IconWrapper>
            </LinkStyled>
          </CreationInfoWrapper>}
        </CollectionInfoWrapper>
      </CollectionCardWrapper>
      {deviceSize >= DeviceSize.xl && <RightSidebar>
        {isOwner && <EditCollectionLink to={`/collection/${collectionId}/edit`}>
          {/* TODO: use link from react-router-dom instead of href to avoid page refresh */}
          <span>Edit collection</span>
          <Icon size={24} name={'gear'} />
        </EditCollectionLink>}
        <LinksWrapper>
          {externalLinks}
        </LinksWrapper>
        <CreationInfoWrapper>
          <Text color={'grey-500'} >Created on {dateFormat(collection.createdAt)}</Text>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`https://unique.subscan.io/unique_collection/${collectionId}`}
          >
            <TextStyled>View on SubScan</TextStyled>
            <IconWrapper>
              <Icon name={'arrow-up-right'} size={16} color={Primary500} />
            </IconWrapper>
          </LinkStyled>
        </CreationInfoWrapper>
      </RightSidebar>}
    </CollectionDetailWrapper>
    <ShareTokenModal isVisible={isShareModalVisible} onClose={() => setIsShareModalVisible(false)} testid='share' />
  </CollectionDetailPaper>;
};

const CollectionDetailPaper = styled(PagePaper)`
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
  @media (max-width: 1024px) {
    overflow: visible;
  }
`;

const BannerWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 240px;
  background-color: var(--color-blue-grey-100);
  overflow: hidden;
  img {
    object-fit: cover;
    min-width: 100%;
  }
  @media (max-width: 1024px) {
    margin-left: calc(var(--prop-gap) * -2);
    margin-right: calc(var(--prop-gap) * -2);
  }
`;

const CollectionDetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: calc(var(--prop-gap) * 1.5) calc(var(--prop-gap) * 2) calc(var(--prop-gap) * 2);
  position: relative;
  @media (max-width: 768px) {
    padding: calc(var(--prop-gap) * 1.5) 0 calc(var(--prop-gap) * 2);
  }
`;

const CollectionCardWrapper = styled.div`
  display: flex;
  gap: calc(var(--prop-gap) * 2);

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
  min-width: 160px;
  .picture {
    display: inline;
  }
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  @media (max-width: 768px) {
    margin-left: calc(var(--prop-gap) * 2);
  }
`;

const CollectionInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--prop-gap);
  h1.unique-font-heading.size-1 {
    margin-bottom: var(--prop-gap);
  }
  @media (min-width: 1920px){
    max-width: 900px;
  }
`;

const OwnerWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: calc(var(--prop-gap) / 2);
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--prop-gap) / 2);
`;

const EditCollectionLink = styled(Link)`
  display: flex;
  gap: var(--prop-gap);
  align-items: center;
  text-align: center;
  margin-bottom: calc(var(--prop-gap) * 1.5);
  color: ${Primary500};
  font-size: 16px;
`;

const LinksWrapper = styled.div`
  display: flex;
  gap: var(--prop-gap);
  justify-content: flex-end;
  margin-bottom: calc(var(--prop-gap) * 1.5);
  flex-wrap: wrap;
`;

const CreationInfoWrapper = styled.div`
  margin-top: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: calc(var(--prop-gap) / 2);
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
  column-gap: calc(var(--prop-gap) / 4);
  width: fit-content;
  margin-top: calc(var(--prop-gap) / 2);
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
const ShareLink = styled.div`
  && {
    cursor: pointer;
  }
`;
const Separator = styled.div`
  && {
    width:1px;
    border-left: 1px solid #D2D3D6;
  }
`;
