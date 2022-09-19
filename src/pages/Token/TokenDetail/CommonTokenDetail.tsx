import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import React, { FC, ReactChild, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Picture } from 'components';
import { CollectionsCard } from './CollectionsCard';
import { AttributesBlock } from './AttributesBlock';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { shortcutText } from 'utils/textUtils';
import { Grey300, Grey500, Primary600 } from 'styles/colors';
import { Avatar } from 'components/Avatar/Avatar';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import config from 'config';
import { useAccounts } from 'hooks/useAccounts';
import { isTokenOwner, toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import Skeleton from 'components/Skeleton/Skeleton';
import { TokenSkeleton } from 'components/Skeleton/TokenSkeleton';
import ShareTokenModal from './ShareTokenModal';
import { CollectionInfoWithSchema, TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { stringToDecodedInfixOrUrlOrCidAndHash } from '../../../utils/helpers';

interface IProps {
  children: ReactChild[]
  token?: TokenByIdResult
  collection?: CollectionInfoWithSchema
  offer?: Offer
  isLoading?: boolean
  testid: string
  isBundle: boolean
}

export const CommonTokenDetail: FC<IProps> = ({
  children,
  token,
  collection,
  offer,
  isLoading,
  testid,
  isBundle
}) => {
  const {
    collectionId,
    collectionName,
    coverImageUrl,
    description,
    attributes,
    image,
    tokenId,
    prefix,
    video
  } = useMemo(() => {
    const { tokenId, collectionId } = offer || token || {};
    const { image, attributes, video } = offer?.tokenDescription || token || {};
    const { name: collectionName, tokenPrefix: prefix, schema, description } = offer?.collectionDescription || collection || {};
    const owner = offer?.seller || token?.owner;
    return {
      tokenId,
      collectionId,
      collectionName,
      prefix,
      coverImageUrl: schema?.coverPicture.fullUrl || '',
      description,
      attributes,
      image: typeof image === 'string' ? image : image?.fullUrl || '',
      video,
      owner
    };
  }, [token, collection, offer]);

  const { selectedAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const { chainData, currentChainId } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const owner = useMemo(() => {
    if (offer) {
      return formatAddress(offer?.seller);
    }
    if (!token?.owner) return undefined;
    return (token.owner ? formatAddress(token.owner) : token.owner);
  }, [token, offer, formatAddress]);

  const isOwner = useMemo(() => {
    if (!selectedAccount || isLoading) return false;
    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }
    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [isLoading, selectedAccount, token, offer]);

  const [shareModalVisible, setShareModalVisible] = useState(false);

  const openShareModal = useCallback(() => {
    setShareModalVisible(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalVisible(false);
  }, []);

  const videoProp = useMemo(() => stringToDecodedInfixOrUrlOrCidAndHash(video), [video]);

  return (
    <CommonTokenDetailStyled>
      <PictureWrapper>
        {isLoading && <Skeleton />}
        {!isLoading &&
          <Picture
            alt={tokenId?.toString() || ''}
            src={image}
            video={videoProp}
            testid={`${testid}-token-picture`}
            badge={(isBundle && deviceSize > DeviceSize.md) ? 'Bundle' : ''}
          />
        }
      </PictureWrapper>
      <Description>
        {isLoading && <TokenSkeleton />}
        {!isLoading && <>
          <Heading size={'1'} testid={`${testid}-token-name`}>{`${prefix || ''} #${tokenId}`}</Heading>
          <ShareLink onClick={openShareModal} data-testid={`${testid}-share-button`}>
            <Text color='grey-500' size='m'>
              Share
            </Text>
            <IconWrapper>
              <Icon name={'shared'} size={24} />
            </IconWrapper>
          </ShareLink>
          <Row data-testid={`${testid}-owner-section`}>
            {isOwner && <Text color='grey-500' size='m'>You own it</Text>}
            {!isOwner && <>
              <Text color='grey-500' size='m'>
                Owned&nbsp;by
              </Text>
              <Account href={`${config.blockchains[currentChainId || '']?.scanUrl}account/${owner || '404'}`}>
                <Avatar size={24} src={DefaultAvatar} address={owner}/>
                <Text color='primary-600' size='m' data-testid={`${testid}-owner-address`}>
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
            avatarSrc={coverImageUrl || ''}
            description={description || ''}
            id={collectionId || -1}
            title={collectionName || ''}
            testid={`${testid}-collection`}
          />
        </>}
      </Description>
      <ShareTokenModal isVisible={shareModalVisible} onClose={closeShareModal} testid={`${testid}-share-modal`} />
    </CommonTokenDetailStyled>
  );
};

const CommonTokenDetailStyled = styled.div`
  display: flex;
  width: 100%;

  @media (max-width: 767px) {
    flex-direction: column;
    row-gap: var(--gap);
    & .unique-modal-wrapper .unique-modal {
      width: calc(520px - (var(--gap) * 3));
    }
  }
  
  @media (max-width: 567px) {
    & .unique-modal-wrapper .unique-modal {
      padding: 24px 16px;
      width: calc(304px - (var(--gap) * 3));
    }
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

  @media (max-width: 1919px) {
    width: 326px;
  }
  
  @media (max-width: 1023px) {
    width: 224px;
  }

  @media (max-width: 767px) {
    width: calc(100vw - var(--gap) * 3);
  }

  @media (max-width: 567px) {
    width: calc(100vw - var(--gap) * 2);
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
    overflow: hidden;
    width: 100%;

    img {
      max-width: 100%;
      max-height: 100%;
      
    }

    svg {
      border-radius: 8px;
      height: auto;
    }
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
