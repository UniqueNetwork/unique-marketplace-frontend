import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { CollectionWithInfoV2Dto, TokenWithInfoV2Dto } from '@unique-nft/sdk';
import { Heading, Dropdown, Icon } from 'components/UI';
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
import { ReportModal } from './ReportModal';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Address } from '@unique-nft/utils';
import { FractionalDetail } from './FractionalDetail';
import { TokenContext } from '../context/TokenContext';
import { FractionalOwnersList } from './FractionalOwnersList';
import { OwnerCard } from 'components/OwnerCard/OwnerCard';
import { BadgeEnum } from 'components/TokenMedia/Picture';
import { INestingToken } from 'components/BundleTree/types';
import { EquippedWearables } from './EquippedWearables';
import { WearablePicture } from 'components/TokenMedia/WearablePicture';
import { DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/schemas';
import { mockWearables } from '../constants';
import { RoyaltiesBlock } from './RoyaltiesBlock';
import { TokenSlider } from './Slider/TokenSlider';
import { BREAKPOINTS } from 'hooks/useBreakpointObserver';

interface IProps {
  token?: TokenWithInfoV2Dto
  collection?: CollectionWithInfoV2Dto
  offer?: Offer
  isLoading?: boolean
  testid: string
  isBundle: boolean
  isNested: boolean
  isOwner: boolean
  topmostOwner?: string
  onBurn(): void
}

export const CommonTokenDetail: FC<IProps> = ({
  children,
  token,
  collection,
  offer,
  isLoading,
  testid,
  isNested,
  topmostOwner,
  onBurn
}) => {
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();
  const { isRft, isRftFracton, isWearable } = useContext(TokenContext);
  const {
    collectionId,
    collectionName,
    attributes,
    attributesList,
    royalties,
    image,
    sliderItems,
    tokenId,
    prefix,
    video,
  } = useMemo(() => {
    const sliderItems = [];
    const { tokenId, collectionId } = offer || token || {};
    const { image, attributes, royalties } = token || {};
    image && sliderItems.push({src: image, type: 'token_image'});
    const { name: collectionName, tokenPrefix: prefix, description } = offer?.collectionDescription || collection || {};
    // const owner = offer?.seller || token?.owner;
    const youtubeVideo = token?.youtube_url;
    youtubeVideo && sliderItems.push({src: token?.youtube_url, type: 'youtube_url'});
    const animation = token?.animation_url;
    animation && sliderItems.push({src: animation, type: 'animation_url'});
    let video;
    if (token?.media) {
      const images = Object.values(token?.media || {}).filter((media) => media.type === 'image');    
      if (images.length > 0 ) {
        for(const image of images) {
          sliderItems.push({src: image.url, type: 'image'});
        }
      }

      const videos = Object.values(token?.media || {}).filter((media) => media.type === 'video');
      if (videos.length > 0 ) {
        video = videos[0];
        for(const video of videos) {
          sliderItems.push({src: video.url, type: 'video'});
        }
      }

      const audios = Object.values(token?.media || {}).filter((media) => media.type === 'audio');    
      if (audios.length > 0 ) {
        for(const audio of audios) {
          sliderItems.push({src: audio.url, type: 'audio', thumbnail: image});
        }
      }
    }
    const attributesList = attributes ? Object.values(attributes) : [];

    return {
      tokenId,
      collectionId,
      collectionName,
      prefix,
      coverImageUrl: offer?.collectionDescription?.schema?.coverPicture?.fullUrl || collection?.info?.cover_image?.url || '',
      description,
      attributes,
      attributesList,
      royalties,
      sliderItems,
      image,
      video
    };
  }, [token, collection, offer]);

  const hasSlider = useMemo(() => {
    return sliderItems?.length > 1;
  }, [sliderItems]);

  const deviceSize = useDeviceSize();

  const { chainProperties, currentChainId, api } = useApi();

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


  const badges: BadgeEnum[] = [
    ...(collection?.mode === 'ReFungible' ? [BadgeEnum.Fractional] : [])
  ];

  const onViewTokenDetails = useCallback((token: INestingToken, mode: string) => {
    if (mode === 'ReFungible' && token.nestingParentToken) {
      const parentOwner = Address.nesting.idsToAddress(token.nestingParentToken.collectionId, token.nestingParentToken.tokenId);
      navigate(`/${currentChainId}/token/${parentOwner}/${token.collectionId}/${token.tokenId}`);
    } else {
      navigate(`/${currentChainId}/token/${token.collectionId}/${token.tokenId}`);
    }
  }, [currentChainId]);

  const [baseTokenImg, setBaseTokenImg] = useState<string | DecodedInfixOrUrlOrCidAndHash | undefined>();
  const [wearableTokenImg, setWearableTokenImg] = useState<string | DecodedInfixOrUrlOrCidAndHash | undefined>();
  useEffect(() => {
    void (async () => {
      if (!isWearable || !collectionId || !tokenId || !currentChainId) return;
      const baseCollectionId = mockWearables[currentChainId].find((item) => collectionId === item.collectionId)?.baseCollections[0];
      if (!baseCollectionId) return;
      const token = await api?.nft?.getToken(baseCollectionId, 1);

      setBaseTokenImg(token?.file?.fullUrl || token?.image.fullUrl || undefined);

      const _token = await api?.nft?.getToken(collectionId, tokenId);

      setWearableTokenImg(_token?.file?.fullUrl || undefined);
    })();
  }, [currentChainId, collectionId, tokenId, isWearable, api?.nft]);

  return (
    <CommonTokenDetailStyled>
      <>
        {isLoading && <PictureSkeleton />}
        {!isLoading && 
          (hasSlider ? (
            <SliderContainer>
              <TokenSlider 
                items={sliderItems}
                isWearable={isWearable}
                wearableSrc={wearableTokenImg || image}
                baseSrc={baseTokenImg}
                badges={badges}
              />
              <EquippedWearables />
            </SliderContainer>
          ) : (
            <PictureWrapper>
              {isLoading && <Skeleton />}
              {!isLoading && (
                <>
                  {!isWearable && (
                    <Picture
                      alt={tokenId?.toString() || ''}
                      src={image}
                      video={video?.url || ''}
                      testid={`${testid}-token-picture`}
                      badges={badges}
                    />
                  )}
                  {isWearable && (
                    <WearablePicture
                      alt={tokenId?.toString() || ''}
                      src={image}
                      wearableSrc={wearableTokenImg || image}
                      baseSrc={baseTokenImg}
                      testid={`${testid}-token-picture`}
                    />
                  )}
                </>
              )}
              <EquippedWearables />
            </PictureWrapper>
          ))}
      </>
      <Description>
        {isLoading && <TokenSkeleton />}
        {!isLoading && (
          <>
            <Link to={`/collection/${collectionId}`}>
              {collectionName} [id {collectionId}]
            </Link>
            <HeadingWrapper>
              <Heading size={'1'} testid={`${testid}-token-name`}>
                {`${prefix || ''} #${tokenId}`}
              </Heading>
              <ShareLink
                onClick={openShareModal}
                data-testid={`${testid}-share-button`}
              >
                <IconWrapper></IconWrapper>
              </ShareLink>
            </HeadingWrapper>
            <OwnerBlock data-testid={`${testid}-owner-section`}>
              {!(isRft && !isRftFracton) && (
                <OwnerCard
                  address={owner || ''}
                  isShort={deviceSize < DeviceSize.xl}
                  canCopy={false}
                  prefixOwned='Owned by'
                  prefixNested='Nested in bundle'
                />
              )}
            </OwnerBlock>
            <Divider />
            {isNested &&
              token?.nestingParentToken?.tokenId &&
              token?.nestingParentToken?.collectionId && (
                <>
                  <Heading size='4'>NFT Wearable for</Heading>
                  <ParentTokenWrapper>
                    <TokensBandleCard
                      tokenId={token.nestingParentToken.tokenId}
                      collectionId={token.nestingParentToken.collectionId}
                      onViewNodeDetails={onViewTokenDetails}
                    />
                  </ParentTokenWrapper>
                  <Divider />
                </>
              )}
            {isRft && !isRftFracton && (
              <>
                <FractionalOwnersList />
                <Divider />
              </>
            )}
            {children}
            {collection?.mode === 'ReFungible' && !!address && (
              <>
                <FractionalDetail testid={`${testid}-fractional`} />
                <Divider />
              </>
            )}
            {attributes && collectionId && (
              <AttributesBlock
                attributes={attributesList}
                collectionId={collectionId}
              />
            )}
            {royalties && Array.isArray(royalties) && (
              <>
                <Divider />
                <RoyaltiesBlock royalties={royalties} />
              </>
            )}
          </>
        )}
      </Description>
      <DropdownStyled
        placement={'right'}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        dropdownRender={() => (
          <DropdownMenu>
            <ShareMenuItem onClick={openShareModal}>
              Share
              <MenuIconWrapper>
                <Icon
                  name={'shared'}
                  size={16}
                  color={'var(--color-primary-500)'}
                />
              </MenuIconWrapper>
            </ShareMenuItem>
            <ScanMenuItem onClick={onScanLinkClick}>
              View on Subscan
              <MenuIconWrapper>
                <Icon
                  name={'arrow-up-right'}
                  size={16}
                  color={'var(--color-primary-500)'}
                />
              </MenuIconWrapper>
            </ScanMenuItem>
            {!offer && (
              <BurnMenuItem onClick={onBurn}>
                Burn
                <MenuIconWrapper>
                  <Icon
                    name={'burn'}
                    size={16}
                    color={'var(--color-coral-500)'}
                  />
                </MenuIconWrapper>
              </BurnMenuItem>
            )}
            <ReportMenuItem onClick={onReportClick}>
              Report
              <MenuIconWrapper>
                <Icon
                  name={'warning'}
                  size={16}
                  color={'var(--color-coral-500)'}
                />
              </MenuIconWrapper>
            </ReportMenuItem>
          </DropdownMenu>
        )}
      >
        <DropdownWrapper>
          <Icon size={32} name={'meatball-menu'} color={'transparent'} />
        </DropdownWrapper>
      </DropdownStyled>
      <ShareTokenModal
        isVisible={shareModalVisible}
        onClose={closeShareModal}
        testid={`${testid}-share-modal`}
      />
      <ReportModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={
          offer?.collectionDescription.tokenPrefix ||
          collection?.tokenPrefix ||
          ''
        }
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
    row-gap: var(--prop-gap);
    & .unique-modal-wrapper .unique-modal {
      width: calc(520px - (var(--prop-gap) * 3));
    }
  }
  
  @media (max-width: 567px) {
    & .unique-modal-wrapper .unique-modal {
      padding: 24px 16px;
      width: calc(304px - (var(--prop-gap) * 3));
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

const PictureSkeleton = styled(Skeleton)`
  margin-right: calc(var(--prop-gap)* 2);
  width: 536px;

  @media (max-width: ${BREAKPOINTS.desktop}px) {
    width: 536px;
    height: 536px;
  }

  @media (max-width: ${BREAKPOINTS.smallDesktop}px) {
    width: 326px;
    height: 326px;
  }

  @media (max-width: ${BREAKPOINTS.tablet}px) {
    width: calc(100vw - var(--prop-gap) * 3);
    height: calc(100vw - var(--prop-gap) * 3);
  }

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    width: calc(100vw - var(--prop-gap) * 2);
    height: calc(100vw - var(--prop-gap) * 2);
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 536px;
  margin-right: calc(var(--prop-gap)* 2);

  @media (max-width: ${BREAKPOINTS.desktop}px) {
    width: 536px;
  }
  
  @media (max-width: ${BREAKPOINTS.smallDesktop}px) {
    width: 326px;
  }

  @media (max-width: ${BREAKPOINTS.tablet}px) {
    width: calc(100vw - var(--prop-gap) * 3);
  }

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    width: calc(100vw - var(--prop-gap) * 2);
  }

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
    left: 2px;
    right: 2px;
    display: flex;
    align-items: center;
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
  color: ${Primary500};
  &:hover {
    color: ${Primary600};
  }
`;

const BurnMenuItem = styled(DropdownMenuItem)`
  color: ${Coral500};
  &:hover {
    background-color: ${Coral100};
  }
`;

const ReportMenuItem = styled(DropdownMenuItem)`
  border-top: 1px dashed ${Grey300};
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

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
`;