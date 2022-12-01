import React, { FC, useMemo } from 'react';
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';
import { Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { Avatar, Picture } from 'components';
import { CollapsableText, Icon, Link, Text } from 'components/UI';
import { isTokenOwner, toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { CollectionStatisticsBlock } from './CollectionStaticticsBlock';
import { CollectionDetailSkeleton } from './CollectionDeteilSkeleton';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { shortcutText } from 'utils/textUtils';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { Primary500, Primary600 } from 'styles/colors';
import CollectionBanner from 'static/images/banner.svg';
import config from 'config';
import { PagePaper } from 'components/PagePaper/PagePaper';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';

interface IProps {
  collection?: CollectionInfoWithSchema
}

export const CollectionDetail: FC<IProps> = ({ collection }) => {
  const deviceSize = useDeviceSize();
  const { selectedAccount } = useAccounts();

  const { chainData, currentChainId } = useApi();

  const { name, description, schema, owner } = collection || {};

  const formatedAddressOwner = useMemo(() => {
    if (!owner) return '';
    return toChainFormatAddress(owner, chainData?.SS58Prefix || 0);
  }, [owner, chainData?.SS58Prefix]);

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
          <Picture alt={name || ''} src={schema?.coverPicture.fullUrl || ''} size={deviceSize <= DeviceSize.md ? 128 : 160} />
        </PictureWrapper>
        <CollectionInfoWrapper>
          <div>
            <Heading size='1' >{name}</Heading>
            <Row>
              <CollapsableText size='l' >{description}</CollapsableText>
            </Row>
          </div>
          <Row>
            <Text color='grey-500' size='m'>ID:</Text>
            <Text size='m'>{collection.id}</Text>
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
          <CollectionStatisticsBlock />
        </CollectionInfoWrapper>
      </CollectionCardWrapper>
      <RightSidebar>
        <LinksWrapper>
          <Icon size={24} name={'discord'} />
          <Icon size={24} name={'instagram'} />
          <Icon size={24} name={'twitter'} />
          <Icon size={24} name={'globe-simple'} />
          <Icon size={24} name={'shared'} />
        </LinksWrapper>
        <div>
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
        </div>
      </RightSidebar>
    </CollectionDetailWrapper>
  </CollectionDetailPaper>;
};

const CollectionDetailPaper = styled(PagePaper)`
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
  @media (max-width: 1279px) {
    flex-direction: column;
    margin: -32px -24px 0;
    border-radius: 0;
  }
`;

const BannerWrapper = styled.div`
  display: flex;
  justify-content: center;
  @media (max-width: 1023px) {
    img {
      height: 180px;  
    }
  }
  @media (max-width: 567px) {
    img {
      height: 120px;  
    }
  }
`;

const CollectionDetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: calc(var(--gap) * 1.5) calc(var(--gap) * 2) calc(var(--gap) * 2);
  position: relative;

  @media (max-width: 1439px) {
    flex-direction: column;
  }
  @media (max-width: 1279px) {
    padding: calc(var(--gap) * 1.5) calc(var(--gap) * 1.5) calc(var(--gap) * 2);
  }
  
`;

const CollectionCardWrapper = styled.div`
  display: flex;
  gap: calc(var(--gap) * 1.5);
  @media (max-width: 1023px) {
    flex-direction: column;
  }
`;

const PictureWrapper = styled.div`
  margin-top: -104px;
  overflow: hidden;
  border-radius: 24px;
  border: 4px solid var(--color-additional-light);
  width: 160px;
  height: 160px;
  background: var(--color-additional-light);
  text-align: center;

  @media (max-width: 1023px) {
    width: 128px;
    height: 128px;
    margin-top: -124px;
    &>div.picture {
      height: 128px;
    }
  }

  @media (max-width: 567px) {
    width: 96px;
    height: 96px;
    margin-top: -80px;
    &>div.picture {
      height: 96px;
    }
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
  justify-content: space-between;
  align-items: flex-end;
  gap: calc(var(--gap) / 2);
  padding-top: 68px;

  @media (max-width: 1439px) {
    padding-top: calc(var(--gap) * 2);
    align-items: flex-start;
    margin-left: 192px;
    &>div:last-child {
      display: flex;
      align-items: baseline;
      gap: var(--gap);
    }
  }

  @media (max-width: 1023px) {
    margin-left: 0;
  }

  @media (max-width: 567px) {
    &>div:last-child {
      flex-direction: column;
      gap: calc(var(--gap) / 2);
    }
  }
`;

const LinksWrapper = styled.div`
  display: flex;
  gap: var(--gap);
  justify-content: flex-end;
  margin-bottom: calc(var(--gap) * 1.5);
  @media (max-width: 1439px) {
    margin-bottom: calc(var(--gap) / 2);
  }
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

const LinkStyled = styled(Link)`
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
