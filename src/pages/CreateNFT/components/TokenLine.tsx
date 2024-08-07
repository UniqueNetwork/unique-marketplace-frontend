import styled from 'styled-components';
import { TemplateProps } from 'react-draggable-list';
import { MouseEventHandler, TouchEventHandler, useState, useRef } from 'react';
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

const TokenLineCellWrapper = ({
  children,
  onMouseDown,
  onTouchStart,
  setHovered,
  dragHandleProps,
}: {
  children: React.ReactNode;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onTouchStart?: TouchEventHandler<HTMLDivElement>;
  setHovered: (value: boolean) => void;
  dragHandleProps?: any;
}) => {
  const handleInteraction = (e: React.SyntheticEvent, callback?: () => void) => {
    e.preventDefault();
    callback?.();
  };

  return (
    <TokenLineCell
      onMouseEnter={(e) => handleInteraction(e, () => setHovered(true))}
      onMouseLeave={(e) => handleInteraction(e, () => setHovered(false))}
      onTouchStart={(e) => handleInteraction(e, () => onTouchStart?.(e))}
      onMouseDown={(e) => handleInteraction(e, () => onMouseDown?.(e))}
      {...dragHandleProps}
    >
      {children}
    </TokenLineCell>
  );
};

export const TokenLine = ({
  item,
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
    external_url,
    media,
    royalties,
    name,
    description
  } = item;
  const {
    onChange,
    tokenPrefix,
    viewMode,
    step,
    newAttributes,
    setNewAttributeValue
  } = commonProps;
  const [willBeRemoved, setWillBeRemoved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(false);
  const { onMouseDown, onTouchStart } = dragHandleProps as {
    onMouseDown: MouseEventHandler<HTMLDivElement> | undefined;
    onTouchStart: TouchEventHandler<HTMLDivElement> | undefined;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelect = () => {
    onChange({
      id,
      tokenId,
      image,
      attributes,
      isValid,
      isSelected: !isSelected,
      royalties,
      media,
      external_url,
      name,
      description
    });
  };

  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const files = filesSizeValidate({ fileArray: event.target.files });

      if (!files?.length) return;

      const file = files[0];
      onChange({
        id,
        tokenId,
        image: { url: URL.createObjectURL(file), file },
        attributes,
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

    const files = filesSizeValidate({ fileArray: event.target.files, withoutMaxFileSize: true });

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
      media,
      external_url,
      name,
      description
    });
  };

  const handleRemoveMedia = () => {
    onChange({
      id,
      tokenId,
      image,
      attributes,
      media: [],
      isValid,
      isSelected,
      royalties,
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

    onChange({
      id,
      tokenId,
      image,
      attributes,
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
          <TokenLineCellWrapper
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            setHovered={setHovered}
          >
            <StyledCheckbox
              label=''
              checked={isSelected}
              onChange={onSelect}
              size={'m'}
              testid={''}
            />
          </TokenLineCellWrapper>
          <TokenLineCellWrapper
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            setHovered={setHovered}
          >
            <TokenLinkTitle>{`${tokenPrefix} #${tokenId}`}</TokenLinkTitle>
          </TokenLineCellWrapper>
          <TokenLineCell>
            <TokenLinkImageWrapper
              onMouseEnter={() => setHoveredImage(true)}
              onMouseLeave={() => setHoveredImage(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {hoveredImage && (
                <Overlay>
                  <OverlayText>Change image</OverlayText>
                </Overlay>
              )}
              <TokenImage alt={`${tokenPrefix}_${id}`} image={image.url} />
            </TokenLinkImageWrapper>
            <FileInput
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageFileChange}
            />
          </TokenLineCell>
          {/* {step === CreateTokensSteps.UPLOAD_MEDIA && (
            <TokenLineCell>
              <UploadWrapper>
                {animation_url ? (
                  <FileInputLabel onClick={handleRemoveSingleFile}>Remove</FileInputLabel>
                ) : (
                  <>
                    <FileInputLabel htmlFor={`single-upload-${id}`}>
                      Upload
                    </FileInputLabel>
                    <FileInput
                      id={`single-upload-${id}`}
                      type='file'
                      accept='image/*'
                      onChange={handleSingleFileChange}
                    />
                  </>
                )}
                {animation_url?.name && (
                  <TextFileUploaded>
                    {shortcutText(animation_url?.name)}
                  </TextFileUploaded>
                )}
              </UploadWrapper>
            </TokenLineCell>
          )} */}
          {step === CreateTokensSteps.UPLOAD_MEDIA && (
            <TokenLineCell>
              <UploadWrapper>
                {media.length > 0 ? (
                  <FileInputLabel onClick={handleRemoveMedia}>Remove files</FileInputLabel>
                ) : (
                  <>
                    <FileInputLabel htmlFor={`multiple-upload-${id}`}>
                      Upload multiple items
                    </FileInputLabel>
                    <MultipleFileInput
                      id={`multiple-upload-${id}`}
                      type='file'
                      accept='.jpg,.jpeg,.png,.gif,.svg,.webp,.mp4,.webm,.mp3,.wav,.gltf,.glb,.usdz,.pdf,.docx,.rtf,.odt'
                      multiple
                      onChange={handleMultipleFilesChange}
                    />
                  </>
                )}
                {media.length > 0 && (
                  <TextFileUploaded>
                    {media.length} files uploaded
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
                placeholder='https://example.com'
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
          {step === CreateTokensSteps.SET_DATA && (
            <FakeCell />
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

  &:hover > div {
    display: flex;
  }
`;

const Overlay = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const OverlayText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
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
    transform: translate3d(-50%, -50%, 0);
    user-drag: none;
    user-select: none;
  }
`;

const TokenLinkTitle = styled(Text).attrs({ appearance: 'block', size: 'l' })`
  word-break: break-all;
  margin: auto;
`;


export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--prop-gap);
  max-width: 800px;
  flex: 1;
  width: 100%;
  align-self: flex-start;

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
    margin: auto 0.
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
  border-top: 1px solid var(--color-table-grey);
  background: var(--color-additional-light);

  &:last-child {
    border-bottom: 1px solid var(--color-table-grey);
  }
`;

export const TokenLineCell = styled.div<{
  isHovered?: boolean;
  isValid?: boolean;
}>`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  text-align: left;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;

  border-right: 1px solid var(--color-table-grey);
  height: 100%;
  box-sizing: border-box;
  border: ${({isValid}) => isValid === false && '1px solid var(--color-additional-warning-500) !important'};

  &:first-child {
    flex: 0.5;
    border-left: 1px solid var(--color-table-grey);
  }

  &:last-child {
    padding: 0;
    border-bottom: ${({isValid}) => isValid === true && '1px solid var(--color-table-grey) !important'};
  }

  &:nth-child(2) {
    flex: 0.5;
  }

  z-index: 1;
`;

export const TokenLineCellAttrAdd = styled.div`
  flex: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  text-align: left;
  font-size: 12px;
  line-height: 15px;
  font-weight: 600;
  border-right: 1px solid var(--color-table-grey);
  height: 100%;
  box-sizing: border-box;
  background-color: var(--color-blue-grey-100);
`;

export const FakeCell = styled.div`
  flex: 0.5;
  background: var(--color-additional-light);
  border: 1px solid var(--color-additional-light);
  margin: -1px 0;
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
  border: none;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  border: none;
  outline: none;
  resize: none;
  padding: 10px;
  padding-top: 24px;
  font-family: var(--font-inter);
  background: transparent;
`;

const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextFileUploaded = styled.div`
  margin: auto;
  text-overflow: ellipsis;
  padding: 0 10px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: auto;
  margin-top: 110px;
  .checkmark {
    background-color: var(--color-additional-light);
    border: 1px solid #000;
  }
`;
