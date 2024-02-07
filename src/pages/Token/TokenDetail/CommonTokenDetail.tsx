import { Heading, Text } from '@unique-nft/ui-kit';
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, Icon } from 'components/UI';
import { Picture } from 'components';
import TokensBandleCard from 'components/BundleTree/NestedSection/TokenCard';
import { AttributesBlock } from './AttributesBlock';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { BlueGrey100, BlueGrey300, Coral100, Coral500, Grey300, Grey500, Primary500, Primary600, Secondary400, Secondary500 } from 'styles/colors';
import config from 'config';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { Offer } from 'api/restApi/offers/types';
import { useApi } from 'hooks/useApi';
import Skeleton from 'components/Skeleton/Skeleton';
import { TokenSkeleton } from 'components/Skeleton/TokenSkeleton';
import ShareTokenModal from './ShareTokenModal';
import { stringToDecodedInfixOrUrlOrCidAndHash } from 'utils/helpers';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { ReportModal } from './ReportModal';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Address } from '@unique-nft/utils';
import { FractionalDetail } from './FractionalDetail';
import { TokenContext } from '../context/TokenContext';
import { FractionalOwnersList } from './FractionalOwnersList';
import { OwnerCard } from 'components/OwnerCard/OwnerCard';
import { BadgeEnum } from 'components/Picture';
import { INestingToken } from 'components/BundleTree/types';
import { CustomizableRecommendation } from './CustomizableRecommendation';

interface IProps {
  token?: TokenByIdResponse
  collection?: CollectionInfoWithSchemaResponse
  offer?: Offer
  isLoading?: boolean
  testid: string
  isBundle: boolean
  isNested: boolean
  isOwner: boolean
  topmostOwner?: string
}

export const CommonTokenDetail: FC<IProps> = ({
  children,
  token,
  collection,
  offer,
  isLoading,
  testid,
  isBundle,
  isNested,
  topmostOwner
}) => {
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();
  const { isRft, isRftFracton } = useContext(TokenContext);
  const {
    collectionId,
    collectionName,
    attributes,
    attributesList,
    image,
    tokenId,
    prefix,
    video
  } = useMemo(() => {
    const { tokenId, collectionId } = offer || token || {};
    const { image, attributes, video } = offer?.tokenDescription || token || {};
    const { name: collectionName, tokenPrefix: prefix, schema, description } = offer?.collectionDescription || collection || {};
    const owner = offer?.seller || token?.owner;

    const attributesList = attributes ? Object.values(attributes) : [];
    return {
      tokenId,
      collectionId,
      collectionName,
      prefix,
      coverImageUrl: schema?.coverPicture?.fullUrl || '',
      description,
      attributes,
      attributesList,
      image: typeof image === 'string' ? image : image?.fullUrl || '',
      video,
      owner
    };
  }, [token, collection, offer]);

  const deviceSize = useDeviceSize();

  const { chainProperties, currentChainId, settings } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const owner = useMemo(() => {
    if (collection?.mode === 'ReFungible' && address) {
      return formatAddress(address);
    }
    if (offer) {
      return formatAddress(offer?.seller);
    }
    if (isNested && topmostOwner) return formatAddress(topmostOwner);
    if (!token?.owner) return undefined;
    return (token.owner ? formatAddress(token.owner) : token.owner);
  }, [token, collection?.mode, offer, formatAddress, address, isNested, topmostOwner]);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const openShareModal = useCallback(() => {
    setShareModalVisible(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalVisible(false);
  }, []);

  const onScanLinkClick = useCallback(() => {
    if (!currentChainId) return;
    setDropdownOpen(false);
    window.open(`${config.blockchains[currentChainId].scanUrl}unique_item/${collectionId}-${tokenId}`, '_blank', 'noopener');
  }, [tokenId, collectionId]);

  const onReportClick = useCallback(() => {
    setDropdownOpen(false);
    setReportModalVisible(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setReportModalVisible(false);
  }, []);

  const videoProp = useMemo(() => stringToDecodedInfixOrUrlOrCidAndHash(video), [video]);

  const badges: BadgeEnum[] = [
    ...(collection?.mode === 'ReFungible' ? [BadgeEnum.Fractional] : []),
    ...(isNested ? [BadgeEnum.Nested] : isBundle ? [BadgeEnum.Bundle] : [])
  ];

  const onViewTokenDetails = useCallback((token: INestingToken, mode: string) => {
    if (mode === 'ReFungible' && token.nestingParentToken) {
      const parentOwner = Address.nesting.idsToAddress(token.nestingParentToken.collectionId, token.nestingParentToken.tokenId);
      navigate(`/${currentChainId}/token/${parentOwner}/${token.collectionId}/${token.tokenId}`);
    } else {
      navigate(`/${currentChainId}/token/${token.collectionId}/${token.tokenId}`);
    }
  }, [currentChainId]);

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
            badges={badges}
          />
        }
      </PictureWrapper>
      <Description>
        {isLoading && <TokenSkeleton />}
        {!isLoading && <>
          <Link to={`/collection/${collectionId}`} >{collectionName} [id {collectionId}]</Link>
          <HeadingWrapper>
            <Heading size={'1'} testid={`${testid}-token-name`}>
              {`${prefix || ''} #${tokenId}`}
            </Heading>
            <ShareLink onClick={openShareModal} data-testid={`${testid}-share-button`}>
              <IconWrapper>
              </IconWrapper>
            </ShareLink>
          </HeadingWrapper>
          <OwnerBlock data-testid={`${testid}-owner-section`}>
            {!(isRft && !isRftFracton) && <OwnerCard
              address={owner || ''}
              isShort={deviceSize < DeviceSize.xl}
              canCopy={false}
              prefixOwned='Owned by'
              prefixNested='Nested in bundle'
            />}
          </OwnerBlock>
          {/* <CustomizableBlock
            token={token}
            offer={offer}
            collection={collection}
          /> */}
          <Divider />
          {isNested && token?.nestingParentToken?.tokenId && token?.nestingParentToken?.collectionId && <>
            <Heading size='4'>NFT Wearable for</Heading>
            <ParentTokenWrapper>
              <TokensBandleCard
                tokenId={token.nestingParentToken.tokenId}
                collectionId={token.nestingParentToken.collectionId}
                onViewNodeDetails={onViewTokenDetails}
              />
            </ParentTokenWrapper>
            <Divider />
          </>}
          {isRft && !isRftFracton && <>
            <FractionalOwnersList />
            <Divider />
          </>}
          {children}
          {collection?.mode === 'ReFungible' && !!address && <>
            <FractionalDetail testid={`${testid}-fractional`} />
            <Divider />
          </>}
          {attributes && collectionId && <AttributesBlock
            attributes={attributesList}
            collectionId={collectionId}
          />}
          <Divider />
          <CustomizableRecommendation
            offer={offer}
            collection={collection}
          />
        </>}
      </Description>
      <DropdownStyled
        placement={'right'}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        dropdownRender={() => (
          <DropdownMenu>
            <ShareMenuItem onClick={openShareModal}>Share
              <MenuIconWrapper>
                <Icon name={'shared'} size={16} color={'var(--color-primary-500)'} />
              </MenuIconWrapper>
            </ShareMenuItem>
            <ScanMenuItem onClick={onScanLinkClick}>View on Subscan
              <MenuIconWrapper>
                <Icon name={'arrow-up-right'} size={16} color={'var(--color-primary-500)'} />
              </MenuIconWrapper>
            </ScanMenuItem>
            <ReportMenuItem onClick={onReportClick}>Report
              <MenuIconWrapper>
                <Icon name={'warning'} size={16} color={'var(--color-coral-500)'} />
              </MenuIconWrapper>
            </ReportMenuItem>
          </DropdownMenu>
          )}
      >
        <DropdownWrapper>
          <Icon
            size={32}
            name={'meatball-menu'}
            color={'transparent'}
          />
        </DropdownWrapper>
      </DropdownStyled>
      <ShareTokenModal isVisible={shareModalVisible} onClose={closeShareModal} testid={`${testid}-share-modal`} />
      <ReportModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={offer?.collectionDescription.tokenPrefix || token?.collection?.tokenPrefix || ''}
        isVisible={reportModalVisible}
        onClose={closeReportModal}
        testid={`${testid}-report-modal`}
      />
    </CommonTokenDetailStyled>
  );
};

const CommonTokenDetailStyled = styled.div`
  display: flex;
  width: 100%;
  position: relative;

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

const HeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  &>h1.unique-font-heading.size-1 {
    margin: 0;
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
    width: 536px;
  }
  
  @media (max-width: 1023px) {
    width: 326px;
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
      border: 1px solid var(--color-grey-200);
      border-radius: 8px;
    }

    svg {
      border-radius: 8px;
      height: auto;
    }
  }
`;

const ParentTokenWrapper = styled.div`
  width: 160px;
  margin-top: 8px;
  &>div {
    min-height: 230px;
    border: 1px solid ${BlueGrey300};
    border-radius: 8px;
  }
  .picture {
    width: 160px;
    height: 160px;
    max-height: 160px;
  }
`;

const OwnerBlock = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;

  && h1 {
    margin-bottom: 0;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  a {
    color: var(--color-primary-500);
    &:hover {
      color: var(--color-primary-500);
      text-decoration: underline;
    }  

  }
`;

const ShareLink = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 120px;
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;

const DropdownStyled = styled(Dropdown)`
  position: absolute;
  right: 0;
`;

const DropdownMenu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const DropdownMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 24px;
  &:hover {
    background: var(--color-primary-100);
  }
`;

const ShareMenuItem = styled(DropdownMenuItem)`
  color: ${Primary500};
  &:hover {
    color: ${Primary600};
  }
`;

const ScanMenuItem = styled(DropdownMenuItem)`
  border-bottom: 1px dashed ${Grey300};
  color: ${Primary500};
  &:hover {
    color: ${Primary600};
  }
`;

const ReportMenuItem = styled(DropdownMenuItem)`
  color: ${Coral500};
  &:hover {
    background-color: ${Coral100};
  }
`;

const DropdownWrapper = styled.div`
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${BlueGrey300};
  background: ${BlueGrey100};
  border-radius: 8px;
  & svg {
    fill: ${BlueGrey300};
    &:hover {
      fill: ${Secondary400};
    }
  }
`;

const MenuIconWrapper = styled.div`
  && {
    width: 16px;
    height: 16px;
    margin-left: 4px;

    path {
      stroke: currentColor;
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
