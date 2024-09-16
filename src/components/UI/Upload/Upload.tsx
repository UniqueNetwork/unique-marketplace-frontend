import React, { ChangeEvent, ReactNode, useCallback, useRef, useState, VFC } from 'react';
import styled from 'styled-components';
import { Icon, Text } from 'components/UI';
import UploadIcon from 'static/icons/upload.svg';
import { Primary500 } from 'styles/colors';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { shortcutText } from '../../../utils/textUtils';

type UploadProps = {
  className?: string;
  disabled?: boolean;
  accept?: string;
  onChange?: (url: string, file: Blob) => void;
  testid?: string;
  label?: ReactNode;
};

export const Upload: VFC<UploadProps> = ({ className, disabled, accept, onChange, testid, label = null }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const deviceSize = useDeviceSize();

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      onChange?.(objectUrl, file);
      e.target.value = '';
    },
    [onChange]
  );

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <UploadWrapper className={className} onClick={handleClick}>
      <Icon file={UploadIcon} size={32} />
      {label}
      {selectedFile && (
        <TextStyled weight='light'>
          {deviceSize === DeviceSize.sm ? shortcutText(selectedFile.name) : selectedFile.name}
        </TextStyled>
      )}
      <input
        ref={inputRef}
        type='file'
        disabled={disabled}
        accept={accept}
        onChange={onFileChange}
        data-testid={testid}
        style={{ display: 'none' }}
      />
    </UploadWrapper>
  );
};

const UploadWrapper = styled.div`
  display: flex;
  position: relative;
  border: 1px dashed ${Primary500};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  padding: var(--prop-gap);
  column-gap: calc(var(--prop-gap) / 2);
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const TextStyled = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
`;
