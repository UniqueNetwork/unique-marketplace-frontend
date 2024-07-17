import { ChangeEvent, DragEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import DraggableList from 'react-draggable-list';
import classNames from 'classnames';

import { Icon, Modal, Text } from 'components/UI';

import { NewToken2, ViewMode } from '../types';
import { TokenCardCommonProps, TokenCardProps } from './TokenCard';
import { getUniqueTraitTypes } from '../helpers';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { CollectionWithInfoV2Dto, PotentialAttribute } from '@unique-nft/sdk';
import { CreateTokensSteps } from '../CreateNFT';
import { TokenPreview } from './TokenPreview/TokenPreview';
import { ConfirmBtn } from 'components';
import TokenInputForm from './TokenInputForm';
import { NewAttributePayload, TokenLine } from './TokenLine';
import FilterComponent from './TokenFilter';
import useFilteredTokens from './useFilteredTokens';
import Create from 'static/images/create.png';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import { IconButton } from 'components/IconButton/IconButton';
import ConfirmDeleteForm from './ConfirmDeleteForm';
import Slider from 'react-slick';

export type TokenListProps = {
  disabled: boolean;
  viewMode: ViewMode;
  tokens: NewToken2[];
  tokenPrefix: string;
  tokensLimit?: number;
  tokensStartId?: number;
  attributesSchema: PotentialAttribute[];
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined;
  schemaVersion: string;
  collection?: CollectionWithInfoV2Dto;
  onChange(tokens: NewToken2[]): void;
  onAddTokens(files: File[]): void;
  step: CreateTokensSteps;
};

export enum SetForAllModalType {
  NAME = 'NAME',
  DESCRIPTION = 'DESCRIPTION',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  ATTRIBUTES = 'ATTRIBUTES',
  NEW_ATTRIBUTE = 'NEW_ATTRIBUTE'
}

export const TokenList = ({
  mode,
  tokens,
  tokenPrefix,
  tokensLimit,
  tokensStartId,
  disabled,
  attributesSchema,
  viewMode,
  schemaVersion,
  step,
  collection,
  onChange,
  onAddTokens
}: TokenListProps) => {
  const deviceSize = useDeviceSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragEnter, setDragEnter] = useState(false);
  const onTokenChange = (token: NewToken2) => {
    const index = tokens.findIndex(({ id }) => id === token.id);

    onChange([...tokens.slice(0, index), token, ...tokens.slice(index + 1)]);
  };

  const onTokenRemove = (id: number) => {
    const lastId = (tokensStartId || 0) + 1;
    const _tokens = [
      ...tokens
        .filter((token) => id !== token.id)
        .map((token, index) => ({ ...token, tokenId: lastId + index }))
    ];
    onChange(_tokens);
  };

  const onDragStart = () => {
    setDragEnter(true);
  };
  const onDragEnd = () => {
    setDragEnter(false);
  };

  // useEffect(() => {
  //   if (attributesSchema && tokens) {
  //     const attributes = getAttributesFromTokens(attributesSchema, tokens);
  //     setAttributes(attributes);
  //     setSelectedAttributes(
  //       selectedAttributes.filter(
  //         ({ key, value }) =>
  //           !!attributes[key] &&
  //           attributes[key].some((attr) => attr.value === value)
  //       )
  //     );
  //   }
  // }, [tokens, attributesSchema]);

  // const hasAttributesFilter =
  //   !!Object.keys(attributes).length &&
  //   Object.values(attributes).some((attribute) => {
  //     return !!attribute?.length;
  //   });

  const [setForAllModal, toggleSetForAllModal] =
    useState<SetForAllModalType | null>(null);

  const handleForAllSubmit = (
    inputValue: string,
    type: SetForAllModalType | null
  ) => {
    const updatedTokens = tokens.map((token) => {
      switch (type) {
        case SetForAllModalType.NAME:
          return { ...token, name: inputValue };
        case SetForAllModalType.DESCRIPTION:
          return { ...token, description: inputValue };
        case SetForAllModalType.EXTERNAL_LINK:
          return { ...token, external_url: inputValue };
        default:
          return token;
      }
    });

    onChange(updatedTokens);
    toggleSetForAllModal(null);
  };

  const [newAttributes, setNewAttributes] = useState<string[]>([]);
  useEffect(() => {
    //this should work only on init
    const attributes = getUniqueTraitTypes(tokens);
    if (attributes.length > 0 && newAttributes.length === 0) {
      setNewAttributes(attributes);
    }
  }, [tokens]);

  const [openAddAttributeModal, setOpenAddAttributeModal] = useState(false);
  const setNewAttributeValue = ({
    trait_type,
    value,
    tokenId
  }: NewAttributePayload) => {
    const updatedTokens = tokens.map((token) => {
      if (token.tokenId === tokenId) {
        //@ts-ignore
        const attributeExists = token.attributes.some(
          (attribute) => attribute.trait_type === trait_type
        );

        let updatedAttributes;
        if (attributeExists) {
          updatedAttributes = token.attributes.map((attribute) =>
            attribute.trait_type === trait_type
              ? { ...attribute, value }
              : attribute
          );
        } else {
          updatedAttributes = [...token.attributes, { trait_type, value }];
        }

        return { ...token, attributes: updatedAttributes };
      }
      return token;
    });

    onChange(updatedTokens);
  };

  //open modal for set all
  const [attributeForSetAll, toggleAttributeForSetAll] = useState<
    string | null
  >(null);
  const deleteNewAttribute = (trait_type: string) => {
    const updatedNewAttributes = newAttributes.filter(
      (attr) => attr !== trait_type
    );
    setNewAttributes(updatedNewAttributes);

    const updatedTokens = tokens.map((token) => {
      const updatedAttributes = token.attributes.filter(
        (attribute) => attribute.trait_type !== trait_type
      );
      return { ...token, attributes: updatedAttributes };
    });

    onChange(updatedTokens);
  };

  const columnsCount = useMemo(() => {
    const res =
      5 + (step === CreateTokensSteps.SET_DATA ? newAttributes.length : 0);
    return res;
  }, [step, newAttributes]);

  const [filters, setFilters] = useState<{
    attributes: { [key: string]: string[] };
    name: string[];
    description: string[];
  }>({ attributes: {}, name: [], description: [] });
  const filteredTokens = useFilteredTokens(tokens, filters);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<string | null>(null);

  return (
    <ScrollWrap>
      <TokenListWrapper
        onDragEnter={onDragStart}
        onDragEnd={onDragEnd}
        onDragExit={onDragEnd}
        columnsCount={columnsCount}
        stepUploadImages={step === CreateTokensSteps.UPLOAD_IMAGES}
      >
        {tokens.length === 0 && <Stub />}
        <ImageUploadArea
          disabled={disabled}
          hasTokens={tokens.length > 0}
          hidden={!dragEnter && tokens.length > 0}
          onUpload={onAddTokens}
          onDragExit={onDragEnd}
        />
        {tokens.length !== 0 && (
          <>
            {viewMode === ViewMode.grid && deviceSize > DeviceSize.sm && (
              <FiltersWrapper>
                <FilterComponent
                  tokens={tokens}
                  onFilterChange={(newFilters) => setFilters(newFilters)}
                />
              </FiltersWrapper>
            )}
            <DraggableContainer ref={containerRef} hasOffset={false}>
              {' '}
              {viewMode === ViewMode.grid && (
                <TokenPreviewWrapper>
                  {filteredTokens.map((token, index) => (
                    <TokenPreview
                      key={token.id}
                      itemSelected={0}
                      anySelected={0}
                      item={token}
                      commonProps={{
                        mode,
                        viewMode,
                        tokenPrefix,
                        attributesSchema,
                        collection,
                        list: filteredTokens,
                        onChange: onTokenChange,
                        onRemove: onTokenRemove,
                        index,
                        // onOpenModifyModal: setEditingToken
                      }}
                      dragHandleProps={{}}
                    />
                  ))}
                </TokenPreviewWrapper>
              )}
              {viewMode === ViewMode.list && (
                <TableWrap>
                  <TableHeader columnsCount={columnsCount}>
                    <TableHeaderCell>
                      <TextStyled>Select</TextStyled>
                    </TableHeaderCell>
                    <TableHeaderCell>
                      <TextStyled>NFT ID</TextStyled>
                    </TableHeaderCell>
                    <TableHeaderCell>
                      <TextStyled>NFT main image *</TextStyled>
                    </TableHeaderCell>
                    {step === CreateTokensSteps.UPLOAD_MEDIA && (
                      <TableHeaderCell>
                        <TextStyledWithHint>
                          Main media file
                          <IconWithHint
                            align={{
                              appearance: 'horizontal',
                              horizontal: 'right',
                              vertical: 'top'
                            }}
                          >
                            Full size image/ GIF/ Video/ Audio
                          </IconWithHint>
                        </TextStyledWithHint>

                        <TextStyledSmall>Max 3Mb</TextStyledSmall>
                      </TableHeaderCell>
                    )}
                    {step === CreateTokensSteps.UPLOAD_MEDIA && (
                      <TableHeaderCell>
                        <TextStyledWithHint>
                          Additional media files
                          <IconWithHint
                            align={{
                              appearance: 'horizontal',
                              horizontal: 'right',
                              vertical: 'top'
                            }}
                          >
                            (Full size image/ GIF/ Video/ Audio) Recommended
                            max. 3Mb
                          </IconWithHint>
                        </TextStyledWithHint>

                        <TextStyledSmall>Max 3Mb</TextStyledSmall>
                      </TableHeaderCell>
                    )}
                    {step === CreateTokensSteps.UPLOAD_MEDIA && (
                      <TableHeaderCell>
                        <TextStyled>External link</TextStyled>
                        <SetAllButton
                          onClick={() => {
                            toggleSetForAllModal(
                              SetForAllModalType.EXTERNAL_LINK
                            );
                          }}
                        >
                          Set for selected
                        </SetAllButton>
                      </TableHeaderCell>
                    )}
                    {step === CreateTokensSteps.SET_DATA && (
                      <TableHeaderCell>
                        <TextStyled>Name</TextStyled>
                        <SetAllButton
                          onClick={() => {
                            toggleSetForAllModal(SetForAllModalType.NAME);
                          }}
                        >
                          Set for selected
                        </SetAllButton>
                      </TableHeaderCell>
                    )}
                    {step === CreateTokensSteps.SET_DATA && (
                      <TableHeaderCell>
                        <TextStyled>Description</TextStyled>
                        <SetAllButton
                          onClick={() => {
                            toggleSetForAllModal(
                              SetForAllModalType.DESCRIPTION
                            );
                          }}
                        >
                          Set for selected
                        </SetAllButton>
                      </TableHeaderCell>
                    )}
                    {step === CreateTokensSteps.SET_DATA &&
                      newAttributes.map((item, index) => (
                        <TableHeaderCellAttribute key={index}>
                          <CloseButton>
                            <IconButton
                              name='trash'
                              color={'var(--color-grey-500)'}
                              size={24}
                              onClick={() => setShowConfirmDeleteModal(item)}
                            />
                          </CloseButton>
                          <TextStyled>{item}</TextStyled>
                          <SetAllButton
                            onClick={() => {
                              toggleAttributeForSetAll(item);
                            }}
                          >
                            Set for selected
                          </SetAllButton>
                        </TableHeaderCellAttribute>
                      ))}
                    {/* not show this column in case no attributes */}
                    {step === CreateTokensSteps.SET_DATA && (
                      <TableHeaderCellAttrAdd>
                        {/* <TextStyled>Add attribute</TextStyled> */}
                        <HeaderAddAttributeWrap
                          onClick={() => {
                            setOpenAddAttributeModal(true);
                          }}
                        >
                          +
                        </HeaderAddAttributeWrap>
                      </TableHeaderCellAttrAdd>
                    )}
                  </TableHeader>

                  {/* @ts-ignore */}
                  <DraggableList<NewToken2, TokenCardCommonProps, FC<TokenCardProps>>
                    constrainDrag
                    unsetZIndex
                    className='draggable-container'
                    itemKey='id'
                    template={TokenLine}
                    list={filteredTokens}
                    container={() => containerRef.current}
                    commonProps={{
                      viewMode,
                      mode,
                      tokenPrefix,
                      attributesSchema,
                      step,
                      newAttributes,
                      setNewAttributeValue,
                      onChange: onTokenChange,
                      onRemove: onTokenRemove
                    }}
                    onMoveEnd={(newList) => {
                      const lastId = (tokensStartId || 0) + 1;
                      return onChange([
                        ...newList.map((token, index) => ({
                          ...token,
                          tokenId: Number(lastId) + Number(index)
                        }))
                      ]);
                    }}
                  />
                </TableWrap>
              )}
            </DraggableContainer>
          </>
        )}
        {
          <Modal
            isVisible={!!setForAllModal}
          >
            <TokenInputForm
              modalType={setForAllModal}
              onSubmit={handleForAllSubmit}
              onClose={() => toggleSetForAllModal(null)}
            />
          </Modal>
        }
        {
          <Modal isVisible={openAddAttributeModal} isFlexible={true}>
            <TokenInputForm
              onClose={() => setOpenAddAttributeModal(false)}
              modalType={SetForAllModalType.NEW_ATTRIBUTE}
              buttonText={'Add Attribute'}
              onSubmit={(newAttr) => {
                const attributeExists = newAttributes.some(
                  (attr) => attr === newAttr
                );

                if (!attributeExists) {
                  setNewAttributes([...newAttributes, newAttr]);
                }

                setOpenAddAttributeModal(false);
              }}
            />
          </Modal>
        }
        {
          <Modal isVisible={!!attributeForSetAll} isFlexible={true}>
            <TokenInputForm
              onClose={() => toggleAttributeForSetAll(null)}
              modalType={SetForAllModalType.NEW_ATTRIBUTE}
              buttonText={`Add attribute`}
              onSubmit={(value) => {
                const updatedTokens = tokens.map((token) => {
                  const attributeExists = token.attributes.some(
                    (attr) => attr.trait_type === attributeForSetAll
                  );

                  let updatedAttributes;
                  if (attributeExists) {
                    updatedAttributes = token.attributes.map((attr) =>
                      attr.trait_type === attributeForSetAll
                        ? { ...attr, value }
                        : attr
                    );
                  } else {
                    updatedAttributes = [
                      ...token.attributes,
                      {
                        trait_type: attributeForSetAll || '',
                        value: value || ''
                      }
                    ];
                  }

                  return { ...token, attributes: updatedAttributes };
                });
                onChange(updatedTokens);
                toggleAttributeForSetAll(null);
              }}
            />
          </Modal>
        }

        {
          <Modal isVisible={!!attributeForSetAll} isFlexible={true}>
            <TokenInputForm
              onClose={() => toggleAttributeForSetAll(null)}
              modalType={SetForAllModalType.NEW_ATTRIBUTE}
              buttonText={`Set ${attributeForSetAll}`}
              onSubmit={(value) => {
                const updatedTokens = tokens.map((token) => {
                  const attributeExists = token.attributes.some(
                    (attr) => attr.trait_type === attributeForSetAll
                  );

                  let updatedAttributes;
                  if (attributeExists) {
                    updatedAttributes = token.attributes.map((attr) =>
                      attr.trait_type === attributeForSetAll
                        ? { ...attr, value }
                        : attr
                    );
                  } else {
                    updatedAttributes = [
                      ...token.attributes,
                      {
                        trait_type: attributeForSetAll || '',
                        value: value || ''
                      }
                    ];
                  }

                  return { ...token, attributes: updatedAttributes };
                });
                onChange(updatedTokens);
                toggleAttributeForSetAll(null);
              }}
            />
          </Modal>
        }

        {
          <Modal isVisible={!!showConfirmDeleteModal} isFlexible={true}>
            <ConfirmDeleteForm
              onClose={() => setShowConfirmDeleteModal(null)}
              onSubmit={() => {
                showConfirmDeleteModal && (deleteNewAttribute(showConfirmDeleteModal));
                setShowConfirmDeleteModal(null);
              }}
            />
          </Modal>
        }
      </TokenListWrapper>
    </ScrollWrap>
  );
};

const TokenListWrapper = styled.div<{
  columnsCount: number;
  stepUploadImages: boolean;
}>`
  display: flex;
  margin-top: calc(var(--prop-gap) * 2.5);
  margin-bottom: calc(var(--prop-gap) * 2);
  min-height: 755px;
  position: relative;
  width: ${({ columnsCount, stepUploadImages }) =>
    stepUploadImages ? 'auto' : `${columnsCount * 240}px`};
  background: #fff;

  .unique-modal {
    padding: 50px 120px;
    width: 320px;
  }
`;

const DraggableContainer = styled.div<{ hasOffset: boolean }>`
  margin: ${({ hasOffset }) => (hasOffset ? '0 -32px' : '0')};
  & > div {
    width: 100%;
    padding-bottom: 10px !important;
  }

  // & > div > div > div {
  //   margin-bottom: 0 !important;
  // }

  // & > div {
  //   margin-bottom: 0 !important;
  // }
  .unique-list {
    gap: 0;
  }
  @media screen and (max-width: 768px) {
    margin: 0;
  }
`;

type ImageUploadAreaProps = {
  disabled: boolean;
  hasTokens: boolean;
  hidden: boolean;
  onUpload?(images: File[]): void;
  onDragExit(): void;
};

export const ImageUploadArea = ({
  disabled,
  hasTokens,
  hidden,
  onUpload,
  onDragExit
}: ImageUploadAreaProps) => {
  const inputFile = useRef<HTMLInputElement>(null);
  const [isDragEnter, setIsDragEnter] = useState(false);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE_MB = 20;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    setIsDragEnter(false);

    if (!inputFile.current) {
      return;
    }

    const files = Array.from(inputFile.current.files || []);
    const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);

    if (validFiles.length < files.length) {
      alert(
        `Some files exceed the maximum size of ${MAX_FILE_SIZE_MB} MB and will not be uploaded.`
      );
    }

    onUpload?.(validFiles);
    onDragExit();

    inputFile.current.value = '';
  };

  const onDragEnter = (event: DragEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    setIsDragEnter(true);
  };

  const onDragLeave = (event: DragEvent<HTMLInputElement>) => {
    setIsDragEnter(false);
    onDragExit();
  };

  return (
    <WrapperCollectionContentStyled
      className={classNames({
        hidden,
        'drag-enter': isDragEnter,
        'full-area': !hasTokens
      })}
    >
      <ContentRelative>
        <Content>
          <ImageCreate src={Create} />
          <ContentHeader>Upload NFT images </ContentHeader>
          <Text size='s'>
            You can bulk-mint 50 NFTs. Optimal image size 500x500 px, 500 KB
          </Text>
        </Content>
      </ContentRelative>
      <input
        disabled={disabled}
        ref={inputFile}
        type='file'
        multiple={true}
        title='Click to select or drop files here'
        accept='image/*'
        onChange={onChange}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragEnd={onDragLeave}
        onDragExit={onDragLeave}
      />
    </WrapperCollectionContentStyled>
  );
};

const TokenPreviewWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 32px;
`;

const WrapperCollectionContentStyled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5fcff;
  border: 1px dashed var(--color-primary-500);
  border-radius: 16px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 300px;
  right: 0;
  border: 1px dashed var(--color-primary-500);
  z-index: 1000;
  left: 0;

  &.full-area {
    left: 0;
  }
  &.hidden {
    opacity: 0;
    z-index: 0;
  }
  input {
    opacity: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    cursor: pointer;
  }
  &:before {
    position: absolute;
    content: '';
    border-radius: var(--prop-border-radius);
    width: 0;
    height: 0;
    opacity: 0;
    top: 50%;
    left: 50%;
    background-color: var(--color-primary-500);
    transition: 0.3s;
  }
  &.drag-enter:before {
    width: 100%;
    height: 100%;
    opacity: 0.4;
    top: 0;
    left: 0;
  }
`;

const Stub = () => {
  return (
    <StubWrapper>
      <Icon name='empty-image' size={80} />
      <Text color='blue-grey-500' size='m' weight='light'>
        Click to select or drop files here
      </Text>
    </StubWrapper>
  );
};

const StubWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  svg {
    margin-bottom: var(--prop-gap);
  }
`;

const TableWrap = styled.div`
  background: #fff;
`;

export const TableHeader = styled.div<{ columnsCount: number }>`
  display: flex;
  width: ${({ columnsCount }) => `${columnsCount * 240}px`};
  height: 100px;
  background-color: #0000000f;
  
`;

export const TableHeaderCell = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  border-right: 1px solid #b9b9b9;
  border-top: 1px solid #b9b9b9;
  height: 100%;
  padding: 18px 0;
  box-sizing: border-box;
  &:first-child {
    flex: 0.5;
    border-left: 1px solid #b9b9b9;
  }

  &:nth-child(2) {
    flex: 0.5;
  }
`;

const CloseButton = styled.div`
  position: absolute;
  cursor: pointer;
  padding: 10px;
  top: 0;
  right: 0;

  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;

  svg {
    fill: var(--color-grey-500);
  }
`;


export const TableHeaderCellAttribute = styled(TableHeaderCell)`
  &:hover ${CloseButton} {
    opacity: 1;
    visibility: visible;
  }
`;

export const TableHeaderCellAttrAdd = styled.div`
  position: relative;
  flex: 0.5;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  border-right: 1px solid #b9b9b9;
  border-top: 1px solid #b9b9b9;
  height: 100%;
  padding: 18px 0;
  box-sizing: border-box;
  background-color: var(--color-blue-grey-100);
  border-top-right-radius: 4px;
`;

const HeaderAddAttributeWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-primary-500);
  border-radius: 16px;
  color: var(--color-primary-500);
  background-color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const TextStyled = styled(Text)`
  text-align: left;
  font-size: 16px;
  line-height: 19px;
  font-weight: 600;
  padding-left: 10px;
`;

export const TextStyledWithHint = styled(Text)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: left;
  font-size: 16px;
  line-height: 19px;
  font-weight: 600;
  padding-left: 10px;

  > div {
    position: absolute;
    right: -28px;
    top: 0px;
  }

  > img {
    height: 18px;
    width: 18px;
  }
`;

export const TextStyledSmall = styled.div`
  margin-top: 2px;
  font-size: 8px;
  color: var(--color-grey-600);
  padding-left: 10px;
`;

const ScrollWrap = styled.div`
  width: 100%;
  overflow-y: scroll;
`;


const FiltersWrapper = styled.div`
  width: 260px;
  margin-right: 32px;
`;

const ImageCreate = styled.img`
  width: 132px;
  height: 132px;
  margin-bottom: 26px;
  z-index: 1;
`;

const ContentRelative = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 0;
`;

const Content = styled.div`
  position: absolute;
  top: 360px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentHeader = styled.div`
  margin-bottom: 8px;
  font-size: 24px;
  line-heignt: 36px;
  font-weight: 700;
`;

const ContentSubtitle = styled.div`
  font-size: 14px;
  line-heignt: 22px;
`;

const SetAllButton = styled.div`
  line-height: 22px;
  font-size: 14px;
  color: var(--color-primary-500);
  cursor: pointer;
  margin-top: 8px;
  padding-left: 10px;
`;

// const ModalWrapper = styled.div`

// `;
