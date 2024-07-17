import styled from 'styled-components';
import { TemplateProps } from 'react-draggable-list';
import { MouseEventHandler, TouchEventHandler, useEffect, useState } from 'react';
import classNames from 'classnames';

import { Modal, Text } from 'components/UI';

import { NewToken2, ViewMode } from '../types';
import { Image } from './TokenBasicCard';
import { PotentialAttribute } from '@unique-nft/sdk';
import { shortcutText, validateLink } from 'utils/textUtils';
import { CreateTokensSteps } from '../CreateNFT';
import { filesSizeValidate } from 'utils/filesSizeValidate';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';

export type NewAttributePayload = {
  trait_type: string;
  value: string;
  tokenId: number;
};

export type TokenCardCommonProps = {
  onChange(token: NewToken2): void;
  onRemove(id: number): void;
  onOpenModifyModal?(token: NewToken2): void;
  tokenPrefix: string;
  attributesSchema: PotentialAttribute[];
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined;
  viewMode: ViewMode;
  step: CreateTokensSteps;
  newAttributes: string[];
  onSingleFileChange?: (file: File) => void;
  onMultipleFilesChange?: (files: FileList) => void;
  setNewAttributeValue: (attribute: NewAttributePayload) => void;
};

export type TokenCardProps = TemplateProps<NewToken2, TokenCardCommonProps>;

export const TokenLine = ({
  item,
  itemSelected,
  dragHandleProps,
  commonProps
}: TokenCardProps) => {
  const {
    id,
    tokenId,
    image,
    attributes,
    isValid,
    isSelected,
    animation_url,
    external_url,
    media,
    royalties,
    name,
    description
  } = item;
  const {
    onChange,
    onRemove,
    tokenPrefix,
    attributesSchema,
    viewMode,
    step,
    newAttributes,
    setNewAttributeValue
  } = commonProps;
  const [willBeRemoved, setWillBeRemoved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { onMouseDown, onTouchStart } = dragHandleProps as {
    onMouseDown: MouseEventHandler<HTMLDivElement> | undefined;
    onTouchStart: TouchEventHandler<HTMLDivElement> | undefined;
  };

  const onSelect = () => {
    onChange({
      id,
      tokenId,
      image,
      attributes,
      isValid,
      isSelected: !isSelected,
      royalties,
      animation_url,
      media,
      external_url,
      name,
      description
    });
  };

  const onStartRemove = () => {
    setWillBeRemoved(true);
    setTimeout(() => {
      onRemove(id);
    }, 250);
  };

  const handleSingleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const files = filesSizeValidate(event.target.files);

      if (!files) return;

      const file = files[0];
      onChange({
        id,
        tokenId,
        image,
        attributes,
        animation_url: {
          file: file,
          url: URL.createObjectURL(file),
          name: file.name
        },
        media,
        isValid,
        isSelected,
        royalties,
        external_url,
        name,
        description
      });
    }
  };

  const handleMultipleFilesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    const files = filesSizeValidate(event.target.files);

    if (!files) return;

    const media: { name: string; type: string; file: File; url: string }[] =
      [];
    const typeCounters: { [key: string]: number } = {
      image: 0,
      animation: 0,
      video: 0,
      audio: 0,
      spatial: 0,
      pdf: 0,
      document: 0,
      other: 0
    };

    Array.from(files).forEach((file) => {
      let type: string;
      switch (file.type) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
          type = 'image';
          break;
        case 'video/mp4':
        case 'video/webm':
        case 'video/ogg':
          type = 'video';
          break;
        case 'audio/mpeg':
        case 'audio/ogg':
        case 'audio/wav':
          type = 'audio';
          break;
        case 'application/pdf':
          type = 'pdf';
          break;
        case 'text/plain':
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          type = 'document';
          break;
        default:
          type = 'other';
      }

      const name = `${type}_${++typeCounters[type]}`;
      media.push({ name, type, file, url: URL.createObjectURL(file) });
    });

    onChange({
      id,
      tokenId,
      image,
      attributes,
      isValid,
      isSelected,
      royalties,
      animation_url,
      media,
      external_url,
      name,
      description
    });

  };

  const [isValidLink, setIsValidLink] = useState(true);

  const handleExternalLinkChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const externalLinkUpdate = event.target.value;
    const isLinkValid = validateLink(externalLinkUpdate);
    setIsValidLink(isLinkValid);

    if (!isLinkValid) return;

    onChange({
      id,
      tokenId,
      image,
      attributes,
      animation_url,
      media,
      isValid,
      isSelected,
      royalties,
      external_url: externalLinkUpdate,
      name,
      description,
    });
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const nameUpdate = event.target.value;

    onChange({
      id,
      tokenId,
      image,
      attributes,
      animation_url,
      media,
      isValid,
      isSelected,
      royalties,
      external_url,
      name: nameUpdate,
      description,
    });
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const descriptionUpdate = event.target.value;
    onChange({
      id,
      tokenId,
      image,
      attributes,
      animation_url,
      media,
      isValid,
      isSelected,
      royalties,
      external_url,
      name,
      description: descriptionUpdate,
    });
  };
  const [attributesModalVisible, setAttributesModalVisible] = useState(false);

  return (
    <>
      <TokenLineWrap
        id={`token-${id}`}
        className={classNames({
          removing: willBeRemoved,
          hovered,
          grid: viewMode === ViewMode.grid
        })}
      >
        <LineContent>
          <TokenLineCell
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
            {/* <SelectCheckbox
              label=''
              checked={isSelected}
              onChange={onSelect}
              testid='select'
            /> */}
            <StyledCheckbox
              label=''
              checked={isSelected}
              onChange={onSelect}
              size={'m'}
              testid={''}
            />
          </TokenLineCell>
          <TokenLineCell
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
            <TokenLinkTitle>{`${tokenPrefix} #${tokenId}`}</TokenLinkTitle>
          </TokenLineCell>
          <TokenLineCell>
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
          </TokenLineCell>
          {step === CreateTokensSteps.UPLOAD_MEDIA && (
            <TokenLineCell>
              <UploadWrapper>
                <FileInputLabel htmlFor={`single-upload-${id}`}>
                  Upload
                </FileInputLabel>
                <FileInput
                  id={`single-upload-${id}`}
                  type='file'
                  accept='image/*'
                  onChange={handleSingleFileChange}
                />
                {animation_url?.name && (
                  <TextFileUploaded>
                    {shortcutText(animation_url?.name)}
                  </TextFileUploaded>
                )}
              </UploadWrapper>
            </TokenLineCell>
          )}
          {step === CreateTokensSteps.UPLOAD_MEDIA && (
            <TokenLineCell>
              <UploadWrapper>
                <FileInputLabel htmlFor={`multiple-upload-${id}`}>
                  Upload multiple items
                </FileInputLabel>
                <MultipleFileInput
                  id={`multiple-upload-${id}`}
                  type='file'
                  accept='.jpeg,.png,.gif,.svg,.webp,.mp4,.webm,.mp3,.wav,.gltf,.glb,.usdz,.pdf'
                  multiple
                  onChange={handleMultipleFilesChange}
                />
                {media?.length > 0 && (
                  <TextFileUploaded>
                    {media?.length} files uploaded
                  </TextFileUploaded>
                )}
              </UploadWrapper>
            </TokenLineCell>
          )}
          {step === CreateTokensSteps.UPLOAD_MEDIA && (
            <TokenLineCell isHovered={hovered} isValid={isValidLink}>
              <ExternalLinkInput
                value={external_url}
                onChange={handleExternalLinkChange}
                placeholder='Enter external link'
              />
            </TokenLineCell>
          )}
          {step === CreateTokensSteps.SET_DATA && (
            <TokenLineCell isHovered={hovered}>
              <ExternalLinkInput
                value={name}
                onChange={handleNameChange}
                placeholder='Enter name'
              />
            </TokenLineCell>
          )}
          {step === CreateTokensSteps.SET_DATA && (
            <TokenLineCell isHovered={hovered}>
              <ExternalLinkInput
                value={description}
                onChange={handleDescriptionChange}
                placeholder='Enter description'
              />
            </TokenLineCell>
          )}
          {step === CreateTokensSteps.SET_DATA &&
            newAttributes.length > 0 &&
            newAttributes.map((attribute, index) => (
              <TokenLineCell key={attribute + '_' + index}>
                <ExternalLinkInput
                  value={
                    attributes.find((attr) => attr.trait_type === attribute)
                      ?.value
                  }
                  onChange={(event) =>
                    setNewAttributeValue({
                      trait_type: attribute,
                      value: event.target.value,
                      tokenId
                    })
                  }
                  placeholder={`Enter ${attribute}`}
                />
              </TokenLineCell>
            ))}
          {step === CreateTokensSteps.SET_DATA && (
            <TokenLineCellAttrAdd></TokenLineCellAttrAdd>
          )}
        </LineContent>
      </TokenLineWrap>
      <Modal
        isVisible={attributesModalVisible}
        onClose={() => {
          setAttributesModalVisible(false);
        }}
        isClosable
      >
        {/* <AttributesForm
          initialAttributes={attributes}
          attributes={attributes}
          attributesSchema={attributesSchema}
          isValid={isValid}
          onChange={onAttributesChange}
        /> */}
      </Modal>
    </>
  );
};

const TokenLinkImageWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const TokenImage = styled(Image)`
  position: relative;
  width: 220px;
  height: 220px;
  overflow: hidden;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: 100%;
    max-height: 100%;
    opacity: 1;
    -webkit-transform: translate3d(-50%, -50%, 0);
    -ms-transform: translate3d(-50%, -50%, 0);
    transform: translate3d(-50%, -50%, 0);
    user-drag: none;
    -webkit-user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
`;

const TokenLinkTitle = styled(Text).attrs({ appearance: 'block', size: 'l' })`
  word-break: break-all;
`;

const SelectCheckbox = styled(Checkbox)`
  margin: auto;
  &.unique-checkbox-wrapper.checkbox-size-s span.checkmark {
    height: 24px;
    width: 24px;
    border-radius: 4px;
    background-color: var(--color-primary-500);
    opacity: 0.4;
    &.checked {
      opacity: 1;
    }
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

export const TokenLineWrap = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 230px;
`;

export const LineContent = styled.div`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  height: 240px;
  border-top: 1px solid #b9b9b9;
  background: #fff;
  // margin: 0 !important;

  &:last-child {
    border-bottom: 1px solid #b9b9b9;
  }
`;

export const TokenLineCell = styled.div<{
  isHovered?: boolean;
  isValid?: boolean;
}>`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  text-align: left;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  border-right: 1px solid #b9b9b9;
  height: 100%;
  box-sizing: border-box;
  &:first-child {
    flex: 0.5;
    border-left: 1px solid #b9b9b9;
  }

  &:last-child {
    padding: 0;
  }

  &:nth-child(2) {
    flex: 0.5;
  }

  ${(props) =>
    props.isHovered &&
    `
    border-color: #007BFF;
  `}

  ${(props) =>
    props.isValid === false &&
    `
    border-color: red;
  `}
`;

export const TokenLineCellAttrAdd =styled.div`
  flex: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  text-align: left;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  border-right: 1px solid #b9b9b9;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--color-blue-grey-100);
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  width: 100%;
  cursor: pointer;
  color: #009cf0;
  padding: 10px;
  font-weight: 400;
  font-size: 14px;
  text-decoration: underline;
`;

const MultipleFileInput = styled(FileInput)``;

const ExternalLinkInput = styled.textarea`
  flex: 1;
  height: 100%;
  border: none;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  border: none;
  outline: none;
  resize: none;
  padding: 10px;
  font-family: var(--font-inter);
`;

const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextFileUploaded = styled.div`
  margin: auto;
  text-overflow: ellipsis;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: auto;
  margin-top: 110px;
  .checkmark {
    background-color: #FFF;
    border: 1px solid #000;
  }
`;