import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import React, { FC, ReactChild, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Picture } from 'components';
import { CollectionsCard } from './CollectionsCard';
import { AttributesBlock } from './AttributesBlock';
import { NFTToken } from 'api/chainApi/unique/types';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { shortcutText } from 'utils/textUtils';
import { Grey300, Grey500, Primary600 } from 'styles/colors';
import { Avatar } from 'components/Avatar/Avatar';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import config from 'config';
import { useAccounts } from 'hooks/useAccounts';
import { isTokenOwner, normalizeAccountId, toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import Skeleton from 'components/Skeleton/Skeleton';
import { TokenSkeleton } from 'components/Skeleton/TokenSkeleton';
import ShareTokenModal from './ShareTokenModal';

interface IProps {
  children: ReactChild[]
  token?: NFTToken
  offer?: Offer
  isLoading?: boolean
}

export const CommonTokenDetail: FC<IProps> = ({
  children,
  token,
  offer,
  isLoading
}) => {
  const {
    collectionId,
    collectionName,
    collectionCover,
    description,
    attributes,
    imageUrl,
    tokenId,
    prefix
  } = useMemo(() => {
    if (offer) {
      const { collectionName, image, prefix, collectionCover, description } = offer.tokenDescription || {};
      const attributes = offer.tokenDescription?.attributes.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}) || [];
      return {
        ...offer,
        collectionName,
        prefix,
        imageUrl: image,
        attributes,
        description,
        collectionCover
      };
    }

    return {
      ...token,
      tokenId: token?.id
    };
  }, [token, offer]);

  const { selectedAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const { chainData } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);

  const owner = useMemo(() => {
    if (offer) {
      return formatAddress(offer?.seller);
    }
    if (!token?.owner) return undefined;
    return token.owner.Substrate ? formatAddress(token.owner.Substrate) : token.owner.Ethereum;
  }, [token, offer, formatAddress]);

  const isOwner = useMemo(() => {
    if (!selectedAccount || isLoading) return false;
    if (offer) {
      return isTokenOwner(selectedAccount.address, { Substrate: offer.seller });
    }
    return isTokenOwner(selectedAccount.address, normalizeAccountId(token?.owner || ''));
  }, [isLoading, selectedAccount, token, offer]);

  const [shareModalVisible, setShareModalVisible] = useState(false);

  const openShareModal = useCallback(() => {
    setShareModalVisible(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalVisible(false);
  }, []);

  return (
    <CommonTokenDetailStyled>
      <PictureWrapper>
        {isLoading && <Skeleton />}
        {!isLoading && <Picture alt={tokenId?.toString() || ''} src={imageUrl} />}
      </PictureWrapper>
      <Description>
        {isLoading && <TokenSkeleton />}
        {!isLoading && <>
          <Heading size={'1'}>{`${prefix || ''} #${tokenId}`}</Heading>
          <ShareLink onClick={openShareModal}>
            <Text color='grey-500' size='m'>
              Share link
            </Text>
            <IconWrapper>
              <Icon name={'shared'} size={24} />
            </IconWrapper>
          </ShareLink>
          <Row>
            {isOwner && <Text color='grey-500' size='m'>You own it</Text>}
            {!isOwner && <>
              <Text color='grey-500' size='m'>
                Owned&nbsp;by
              </Text>
              <Account href={`${config.scanUrl}account/${owner || '404'}`}>
                <Avatar size={24} src={DefaultAvatar} address={owner}/>
                <Text color='primary-600' size='m'>
                  {deviceSize === DeviceSize.lg ? owner || '' : shortcutText(owner || '') }
                </Text>
              </Account>
            </>}
          </Row>
          <Divider />
          {children}
          {attributes && <AttributesBlock attributes={attributes} />}
          <Divider />
          <CollectionsCard
            avatarSrc={collectionCover || ''}
            description={description || ''}
            id={collectionId || -1}
            title={collectionName || ''}
          />
        </>}
      </Description>
      <ShareTokenModal isVisible={shareModalVisible} onClose={closeShareModal} />
    </CommonTokenDetailStyled>
  );
};

const CommonTokenDetailStyled = styled.div`
  display: flex;
  width: 100%;

  @media (max-width: 767px) {
    & .unique-modal-wrapper .unique-modal {
      width: calc(520px - (var(--gap) * 3));
    }
  }
  
  @media (max-width: 567px) {
    & .unique-modal-wrapper .unique-modal {
      padding: 24px 16px;
      width: calc(304px - (var(--gap) * 3));
    }
    flex-direction: column;
    row-gap: var(--gap);
  }
`;

const IconWrapper = styled.div`
  margin-left: 4px;
  margin-right: 16px;

  svg {
    fill: ${Grey500};
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 536px;
  margin-right: calc(var(--gap) * 2);
  
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  div[class^=Skeleton] {
    position: absolute;
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
    

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
      height: auto;
    }

    @media (max-width: 768px) {
      min-width: 224px;
    }

    @media (max-width: 567px) {
      width: 100vw;
      min-width: 100vw;
    }
  }
  @media (max-width: 567px) {
    width: 100vw;
    margin-left: calc(0px - var(--gap));
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;

  && h1 {
    margin-bottom: 0;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ShareLink = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--gap);
  cursor: pointer;
  width: 120px;
`;

const Account = styled.a`
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  color: ${Primary600};
  span {
    margin-left: 8px;
  }
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
