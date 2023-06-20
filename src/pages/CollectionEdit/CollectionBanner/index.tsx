import { Heading, Text } from '@unique-nft/ui-kit';
import { Button, Upload } from 'components/UI';
import { useCallback } from 'react';
import styled from 'styled-components';

interface CollectionBannerProps {
  src?: string
  onChange(src: string, file: Blob): void
  onRemove(): void
}

const optimalImageSizeDescription = 'Optimal image size 1824×240 px';

export const CollectionBannerComponent = ({ src, onChange, onRemove }: CollectionBannerProps) => {
  const onReplaceClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e: Event) => {
      if (!e.target) return;
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const src = URL.createObjectURL(file);
      onChange(
        src,
        file
      );
      input.remove();
    };

    input.click();
  }, [onChange]);

  return <BannerWrapper>
    {src && <img src={src} />}
    {!src && <UploadBanner
      label={<UploadBannerLabelWrapper>
        <Heading size='3'>
          Upload or drag the image here
        </Heading>
        <Text size='s'>{optimalImageSizeDescription}</Text>
        {src && <ButtonsWrapper>
          <Button title='Replace image' role='primary' />
          <Button title='Delete' role='danger' />
        </ButtonsWrapper>}
      </UploadBannerLabelWrapper>}
      onChange={onChange}
    />}
    {src && <BannerOverlayWrapper>
      <Heading size='3'>
        Upload or drag the image here
      </Heading>
      <Text size='s'>{optimalImageSizeDescription}</Text>
      <ButtonsWrapper>
        <Button title='Replace image' role='primary' onClick={onReplaceClick} />
        <Button title='Delete' role='danger' onClick={onRemove} />
      </ButtonsWrapper>
      </BannerOverlayWrapper>}
  </BannerWrapper>;
};

const BannerWrapper = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  height: 240px;
  background: #F5FCFF;
  border: 1px dashed var(--color-primary-500);
  border-radius: 8px 8px 0px 0px;
  overflow: hidden;

  @media (max-width: 1024px) {
    border-radius: 0px;
    margin: 0 -24px;
  }
`;

const UploadBanner = styled(Upload)`
  width: 100%;
  border: none;
  flex-direction: column;
  cursor: pointer;
`;

const UploadBannerLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  h3.unique-font-heading.size-3 {
    margin-bottom: 0;
    margin-top: var(--gap);
  }
`;

const BannerOverlayWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255, 0.5);
  &:hover {
    opacity: 1;
  }
`;

const ButtonsWrapper = styled.div`
  margin-top: var(--gap);
  display: flex;
  gap: var(--gap);
`;
