import React, { FC, useCallback } from 'react';
import styled from 'styled-components/macro';
import UploadIcon from '../../static/icons/upload.svg';
import { Icon } from '../Icon/Icon';

interface UploadProps {
  onChange(file: File): void;
}

export const Upload: FC<UploadProps> = ({ onChange }) => {
  const onInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files && event.target?.files.length) {
      onChange(event.target.files[0]);
    }
  }, [onChange]);

  return (
    <UploadWrapper>
      <input type={'file'} onChange={onInputChange} accept={'.json'} />
      <Icon path={UploadIcon} size={48} />
    </UploadWrapper>
  );
};

const UploadWrapper = styled.div`
  position: relative;
  background: #FFFFFF;
  padding: 52px 0;
  border: 1px dashed var(--color-primary-500);
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  input {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    cursor: pointer;
  }
`;
