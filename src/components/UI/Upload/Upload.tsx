import { Text } from '@unique-nft/ui-kit';
import React, { ChangeEvent, useCallback, useRef, useState, VFC } from 'react';
import styled from 'styled-components';
import { Icon } from 'components/UI/Icon/Icon';
import UploadIcon from 'static/icons/upload.svg';
import { Primary500 } from 'styles/colors';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { shortcutText } from '../../../utils/textUtils';

type UploadProps = {
  className?: string;
  disabled?: boolean;
  accept?: string;
  onChange?: (url: string, file: Blob) => void;
  testid?: string
};

export const Upload: VFC<UploadProps> = ({ className, disabled, accept, onChange, testid }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const deviceSize = useDeviceSize();

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    const file = e.target.files[0];
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    onChange?.(objectUrl, file);
  }, [onChange]);

  return <UploadWrapper className={className} onClick={inputRef.current?.click}>
    <Icon file={UploadIcon} size={32} />
    {selectedFile && <TextStyled weight='light'>{deviceSize === DeviceSize.sm ? shortcutText(selectedFile.name) : selectedFile.name}</TextStyled>}
    <input
      ref={inputRef}
      type='file'
      disabled={disabled}
      accept={accept}
      onChange={onFileChange}
      data-testid={testid}
    />
  </UploadWrapper>;
};

const UploadWrapper = styled.div`
  display: flex;
  position: relative;
  border: 1px dashed ${Primary500};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  padding: var(--gap);
  column-gap: calc(var(--gap) / 2);

  input {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const TextStyled = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
`;
