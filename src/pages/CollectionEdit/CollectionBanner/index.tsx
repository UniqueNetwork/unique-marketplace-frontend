import { Heading, Text } from '@unique-nft/ui-kit';
import { Upload } from 'components/UI';
import styled from 'styled-components';

interface CollectionBannerProps {
  src?: string
  onChange(src: string, file: Blob): void
  onRemove(): void
}

export const CollectionBannerComponent = ({ src, onChange }: CollectionBannerProps) => {
  return <BannerWrapper>
    {src && <img src={src} />}
    {!src && <UploadBanner
      label={<UploadBannerLabelWrapper>
        <Heading size='3'>
          Upload or drag the image here
        </Heading>
        <Text size='s'>Optimal image size 3648×480 px</Text>
      </UploadBannerLabelWrapper>}
      onChange={onChange}
    />}

  </BannerWrapper>;
};

const BannerWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 240px;
  background: #F5FCFF;
  border: 1px dashed var(--color-primary-500);
  border-radius: 8px 8px 0px 0px;

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
