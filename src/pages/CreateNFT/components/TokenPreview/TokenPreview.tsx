import styled from 'styled-components';
import { TemplateProps } from 'react-draggable-list';
import { MouseEventHandler, TouchEventHandler, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { Modal, Text } from 'components/UI';

import { NewToken2, ViewMode } from '../../types';
import { Image } from '../TokenBasicCard';
import { CollectionWithInfoV2Dto, PotentialAttribute } from '@unique-nft/sdk';
import { CommonTokenDetail } from 'pages/Token/TokenDetail/CommonTokenDetail';
import { useAccounts } from 'hooks/useAccounts';
import Slider from 'react-slick';
import { CustomNextArrow, CustomPrevArrow } from 'pages/Token/TokenDetail/Slider/CustomSliderArrows';
import { CustomTokenPreviewArrowsNext, CustomTokenPreviewArrowsPrev } from './CustomTokenPreviewArrows';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';

export type TokenCardCommonProps = {
  onChange(token: NewToken2): void;
  onRemove(id: number): void;
	onSelect(id: number): void;
  onOpenModifyModal?(token: NewToken2): void;
  tokenPrefix: string;
  list?: NewToken2[];
  index: number;
  attributesSchema: PotentialAttribute[];
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined;
  viewMode: ViewMode;
  collection?: CollectionWithInfoV2Dto;
};

export type TokenCardProps = TemplateProps<NewToken2, TokenCardCommonProps>;

export const TokenPreview = ({
  item,
  dragHandleProps,
  commonProps
}: TokenCardProps) => {
  const {
    id,
    tokenId,
    image,
  } = item;
  const {
    tokenPrefix,
    collection,
    list,
    index,
		onSelect
  } = commonProps;
  const [willBeRemoved, setWillBeRemoved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { onMouseDown, onTouchStart } = dragHandleProps as {
    onMouseDown: MouseEventHandler<HTMLDivElement> | undefined;
    onTouchStart: TouchEventHandler<HTMLDivElement> | undefined;
  };

  const { selectedAccount } = useAccounts();
  const [showTokendetails, setShowTokendetails] = useState<boolean>(false);

  const horizontalSliderRef = useRef<Slider>(null);
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <CustomTokenPreviewArrowsNext />,
    prevArrow: <CustomTokenPreviewArrowsPrev />,
    beforeChange: (oldIndex: number, newIndex: number) =>
      setActiveIndex(newIndex)
  };
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TokenPreviewWrapper id={`token-${id}`}>
      <TokenWrapper
        className={classNames({
          removing: willBeRemoved,
          hovered
        })}
      >
				<CheckboxWrapper>
					<Checkbox
						label=''
						checked={item.isSelected}
						onChange={() => onSelect(item.id)}
						size={'m'}
						testid={''}
					/>
				</CheckboxWrapper>
        <TokenBasicWrapper>
          <TokenLinkImageWrapper>
            <TokenImage alt={`${tokenPrefix}_${id}`} image={image.url} />
          </TokenLinkImageWrapper>
          <TokenCardActions onClick={() => setShowTokendetails(true)}>
            <TokenLinkTitle>{`${tokenPrefix} #${tokenId}`}</TokenLinkTitle>
          </TokenCardActions>
        </TokenBasicWrapper>
      </TokenWrapper>
      <Modal
        isVisible={!!showTokendetails}
        onClose={() => {
          setShowTokendetails(false);
        }}
        isClosable
        isFlexible={true}
      >
        <Slider ref={horizontalSliderRef} {...settings} initialSlide={index}>
          {
            list?.map((token) => (        <CommonTokenDetailWrapper>
              <CommonTokenDetail
                token={{
                  ...token,
                  image: token.image.url,
                  collectionId: collection?.collectionId || 0,
                  owner: selectedAccount?.address || '',
                  animation_url: token?.animation_url?.url,
                }}
                collection={collection}
                isLoading={false}
                testid={`${'create-token-preview'}`}
                isOwner={true}
                isNested={false}
                previewMode={true}
                isBundle={false}
                onBurn={() => {}}
              ></CommonTokenDetail>
            </CommonTokenDetailWrapper>))

          }
        </Slider>
      </Modal>
    </TokenPreviewWrapper>
  );
};

const TokenWrapper = styled.div`
	position: relative;
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  word-break: break-all;
  width: 268px;
  height: 328px;
  display: flex;
  background: white;
  border-style: none none dashed none;
  border-color: var(--color-grey-100);
  gap: var(--prop-gap);
  transition: opacity 0.2s, transform 0.2s;
  position: relative;
  border: 1px solid #c9d0d7;
	border-radius: 6px;
  box-sizing: border-box;

  &.hovered {
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  &.removing {
    transform: scale(0.1);
    opacity: 0;
    max-height: 0;
  }

  @media screen and (max-width: 568px) {
    flex-direction: column;
    padding-bottom: 16px;
  }
`;

const TokenBasicWrapper = styled.div`
  display: block;
`;

const TokenLinkImageWrapper = styled.div`
  position: relative;
  width: 268px;
  height: 268px;
  @media screen and (max-width: 768px) {
    width: 180px;
    height: 180px;
  }
  @media screen and (max-width: 568px) {
    width: 100%;
    height: auto;
  }

	div {
		border-radius: 6px 6px 0 0;
	}
`;

const TokenImage = styled(Image)`
	border-radius: 0;
  margin-bottom: calc(var(--prop-gap) / 2);
  img {
    user-drag: none;
    -webkit-user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
`;

const TokenCardActions = styled.div`
  padding: calc(var(--prop-gap) / 2) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 250px;
  background-color: white;
  .unique-button {
    padding: 0;
    &:hover {
      svg {
        fill: var(--color-primary-500);
        transition: 0.2s;
      }
    }
    &.remove:hover {
      svg {
        fill: var(--color-coral-500);
        transition: 0.2s;
      }
    }
  }
  @media screen and (max-width: 768px) {
    width: 180px;
  }
  @media screen and (max-width: 568px) {
    width: 100%;
  }
`;

const TokenLinkTitle = styled(Text).attrs({ appearance: 'block', size: 'l' })`
  word-break: break-all;
  margin-left: 8px;
	color: var(--color-primary-500);
	cursor: pointer;

	&:hover {
		text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--prop-gap);
  max-width: 800px;
  flex: 1;
  width: 100%;
  align-self: flex-start;
  & > .unique-text {
    margin: 0;
    white-space: break-spaces;
    word-break: normal;
  }
  h4.unique-font-heading.size-4 {
    grid-column: 1 / span 2;

    @media screen and (max-width: 568px) {
      grid-column: 1 / span 1;
    }
  }
  .unique-input-text {
    width: 100%;
    margin: auto 0;
  }
  div.unique-select {
    width: 100%;
    margin: auto 0;
  }
  @media screen and (max-width: 568px) {
    grid-template-columns: 1fr;
    gap: calc(var(--prop-gap) / 2);
  }
`;

const CommonTokenDetailWrapper = styled.div`
  margin-top: 35px;
  width: 960px;
  max-width: 80vw;
  height: 650px;
`;

const TokenPreviewWrapper = styled.div`
  .unique-modal {
    width: 1060px !important;
    height: 720px !important;
    padding: 0 30px !important;
    box-sizing: border-box !important; 
  }
`;

const CheckboxWrapper = styled.div`
	position: absolute;
	top: 16px;
	right: 16px;
	width: 22px;
	height: 22px;
	border-radius: 4px;
	background-color: #FFF;
	z-index: 1;
`;