import React, { FC, useCallback, useState } from 'react';
import styled from 'styled-components/macro';
import { Text, Icon } from '@unique-nft/ui-kit';

import UploadIcon from '../../static/icons/upload.svg';
import { AdditionalLight, Primary500 } from '../../styles/colors';

interface UploadProps {
  onChange(file: File): void;
}

export const Upload: FC<UploadProps> = ({ onChange }) => {
  const [fileName, setFileName] = useState<string>();
  const onInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files && event.target?.files.length) {
      onChange(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  }, [onChange]);

  return (
    <UploadWrapper>
      <input type={'file'} onChange={onInputChange} accept={'.json'} />
      <Icon file={UploadIcon} size={48} />
      {fileName && <Text color={'primary-500'}>{fileName}</Text>}
    </UploadWrapper>
  );
};

const UploadWrapper = styled.div`
  position: relative;
  background: ${AdditionalLight};
  padding: 52px var(--gap);
  border: 1px dashed ${Primary500};
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  input {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    cursor: pointer;
  }
  & > .unique-text {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  } 
`;
