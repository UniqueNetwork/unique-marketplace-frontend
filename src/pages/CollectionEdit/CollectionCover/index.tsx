import { useCallback } from 'react';
import styled from 'styled-components';

import { Picture } from 'components';
import { Button, Text, Upload } from 'components/UI';

interface CollectionCoverProps {
  name: string
  src?: string
  onChange(src: string, file: Blob): void
  onRemove(): void
}

export const CollectionCover = ({ name, src, onChange, onRemove }: CollectionCoverProps) => {
  const onReplaceClick = useCallback(() => {
    throw new Error('Not imlemented');
  }, []);

  return <CollectionCoverWrapper>
    <PictureWrapper>
      {src && <Picture alt={name || ''} src={src} size={160} />}
      {!src && <UploadCover onChange={onChange} />}
    </PictureWrapper>
    {src && <ButtonsWrapper>
      <Button title='Replace image' role='primary' onClick={onReplaceClick}/>
      <Button title='Delete' role='danger' onClick={onRemove} />
      <Text size='xs'>Optimal image size<br/>320×320 px</Text>
    </ButtonsWrapper>}
    {!src && <ButtonsWrapper>
      <Text size='s'>Upload or drag the image</Text>
      <Text size='xs'>Optimal image size<br/>320×320 px</Text>
    </ButtonsWrapper>}
  </CollectionCoverWrapper>;
};

const CollectionCoverWrapper = styled.div`
  margin-top: -80px;
  width: 160px;
  min-width: 160px;
`;

const UploadCover = styled(Upload)`
  width: 100%;
  border: none;
  flex-direction: column;
  border-radius: 24px;
  cursor: pointer;
`;

const ButtonsWrapper = styled.div`
  margin-top: var(--gap);
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap) / 2);
  span {
    text-align: center;
  }
`;

const PictureWrapper = styled.div`
  overflow: hidden;
  border-radius: 24px;
  border: 4px solid var(--color-additional-light);
  width: 160px;
  min-width: 160px;
  height: 160px;
  background-color: var(--color-primary-100);
`;
