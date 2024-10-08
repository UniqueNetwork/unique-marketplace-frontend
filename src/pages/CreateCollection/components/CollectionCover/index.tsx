import { useCallback } from 'react';
import styled from 'styled-components';

import { Picture } from 'components';
import { Button, Text, Upload } from 'components/UI';

interface CollectionCoverProps {
  name: string;
  src?: string;
  onChange(src: string, file: Blob): void;
  onRemove(): void;
}

export const CollectionCover = ({ name, src, onChange, onRemove }: CollectionCoverProps) => {
  const onReplaceClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e: Event) => {
      if (!e.target) return;
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const src = URL.createObjectURL(file);
      onChange(src, file);
      input.remove();
    };

    input.click();
  }, [onChange]);

  return (
    <CollectionCoverWrapper>
      <PictureWrapper>
        <PictureWrapperDotted>
          {src ? (
            <Picture alt={name || ''} src={src} size={160} />
          ) : (
            <UploadCover
              onChange={(url, file: Blob) => onChange(URL.createObjectURL(file), file)}
              accept={'image/*'}
            />
          )}
        </PictureWrapperDotted>
      </PictureWrapper>

      <ButtonsWrapper>
        {src ? (
          <>
            <Button title='Replace image' role='primary' onClick={onReplaceClick} />
            <Button title='Delete' role='danger' onClick={onRemove} />
            <Text size='xs'>Optimal image size<br />320×320 px</Text>
          </>
        ) : (
          <>
            <Text size='s'>Upload or drag the image</Text>
            <Text size='xs'>Optimal image size<br />320×320 px</Text>
          </>
        )}
      </ButtonsWrapper>
    </CollectionCoverWrapper>
  );
};

const CollectionCoverWrapper = styled.div`
  position: absolute;
  z-index: 1;
  margin-top: -80px;
  width: 160px;
  min-width: 160px;
`;

const ButtonsWrapper = styled.div`
  margin-top: var(--prop-gap);
  display: flex;
  flex-direction: column;
  gap: calc(var(--prop-gap) / 2);
  span {
    text-align: center;
  }
`;
const PictureWrapper = styled.div`
  border-radius: 24px;
  width: fit-content;
  border: 4px solid var(--color-additional-light);
  cursor: pointer;
  position: relative;
`;

const PictureWrapperDotted = styled.div`
  overflow: hidden;
  border-radius: 24px;
  border: 1px dashed var(--color-primary-600);
  width: 160px;
  min-width: 160px;
  height: 160px;
  background-color: var(--color-primary-100);
  position: relative;
  z-index: 0;

  div {
    padding: 0 !important;
    position: relative;
    object-fit: cover;
    width: 100%;
    height: 100%;

  }
  img {
    // object-fit: cover;
    // width: 100%;
  }
`;

const UploadCover = styled(Upload)`
  width: 100%;
  border: none;
  flex-direction: column;
  border-radius: 24px;
  cursor: pointer;
  z-index: 10;
`;
