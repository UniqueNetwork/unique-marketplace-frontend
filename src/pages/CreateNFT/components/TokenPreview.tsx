import styled from 'styled-components';
import { TemplateProps } from 'react-draggable-list';
import { MouseEventHandler, TouchEventHandler, useState } from 'react';
import classNames from 'classnames';

import { Modal, Text } from 'components/UI';

import { NewToken2, ViewMode } from '../types';
import { Image } from './TokenBasicCard';
import { CollectionWithInfoV2Dto, PotentialAttribute } from '@unique-nft/sdk';
import { CommonTokenDetail } from 'pages/Token/TokenDetail/CommonTokenDetail';
import { useAccounts } from 'hooks/useAccounts';

export type TokenCardCommonProps = {
  onChange(token: NewToken2): void;
  onRemove(id: number): void;
  onOpenModifyModal?(token: NewToken2): void;
  tokenPrefix: string;
  attributesSchema: PotentialAttribute[];
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined;
  viewMode: ViewMode;
  collection?: CollectionWithInfoV2Dto;
};

export type TokenCardProps = TemplateProps<NewToken2, TokenCardCommonProps>;

export const TokenPreview = ({
  item,
  itemSelected,
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
    collection
  } = commonProps;
  const [willBeRemoved, setWillBeRemoved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { onMouseDown, onTouchStart } = dragHandleProps as {
    onMouseDown: MouseEventHandler<HTMLDivElement> | undefined;
    onTouchStart: TouchEventHandler<HTMLDivElement> | undefined;
  };

  const { selectedAccount } = useAccounts();
  const [showTokendetails, setShowTokendetails] = useState<boolean>(false);

  return (
    <>
      <TokenWrapper
        id={`token-${id}`}
        className={classNames({
          removing: willBeRemoved,
          hovered
        })}
        onClick={() => setShowTokendetails(true)}
      >
        <TokenBasicWrapper>
          <TokenLinkImageWrapper
            onMouseEnter={(e) => {
              e.preventDefault();
              setHovered(true);
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              setHovered(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              onTouchStart?.(e);
            }}
            onMouseDown={(e) => {
              onMouseDown?.(e);
            }}
          >
            <TokenImage alt={`${tokenPrefix}_${id}`} image={image.url} />
          </TokenLinkImageWrapper>
          <TokenCardActions>
            <TokenLinkTitle>{`${tokenPrefix} #${tokenId}`}</TokenLinkTitle>
          </TokenCardActions>
        </TokenBasicWrapper>
      </TokenWrapper>

      <Modal
        isVisible={!!showTokendetails}
        onClose={() => {
          console.log('ON_CLOSE');
          setShowTokendetails(false);
        }}
        isClosable
        isFlexible={true}
      >
        <CommonTokenDetailWrapper>
          <CommonTokenDetail
          //@ts-ignore
            token={{
              ...item,
              image: item.image.url,
              collectionId: collection?.collectionId || 0,
              owner: selectedAccount?.address || '',
              animation_url: item?.animation_url?.url,
            }}
            collection={collection}
            isLoading={false}
            testid={`${'create-token-preview'}`}
            isOwner={true}
            isNested={false}
            previewMode={true}
          ></CommonTokenDetail>
        </CommonTokenDetailWrapper>
      </Modal>
    </>
  );
};

const TokenWrapper = styled.div`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  word-break: break-all;
  width: 268px;
  height: 328px;
  cursor: pointer;
  display: flex;
  background: white;
  border-style: none none dashed none;
  border-color: var(--color-grey-100);
  gap: var(--prop-gap);
  transition: opacity 0.2s, transform 0.2s;
  position: relative;
  border: 1px solid #c9d0d7;
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
`;

const TokenImage = styled(Image)`
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
`;
