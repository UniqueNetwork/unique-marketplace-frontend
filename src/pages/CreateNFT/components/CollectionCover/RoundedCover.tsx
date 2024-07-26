import { IdentityIcon } from 'components/UI/IdentityIcon';
import { VFC } from 'react';
import styled from 'styled-components/macro';

interface RoundedCoverProps {
  collectionId: number;
  coverSrc: string | undefined;
}

export const RoundedCover: VFC<RoundedCoverProps> = ({
  collectionId,
  coverSrc
}) => (
  <Wrapper src={coverSrc}>
    {!coverSrc && (
      <IdentityIcon
        address={`collection ${collectionId ?? ''} cover`}
        size='84'
      />
    )}
  </Wrapper>
);

const Wrapper = styled.div.attrs<{ src?: string }>((props) => ({
  src: props.src
}))<{ src?: string }>`
  background-image: ${(props) => (props.src ? `url(${props.src})` : 'none')};
  background-color: white;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border: 2px solid white;
  box-sizing: border-box;
  border-radius: 48px;
  height: 88px;
  width: 88px;
  position: absolute;
  top: calc(100% - 46px);
  left: calc(50% - 46px);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 767px) {
    width: 64px;
    height: 64px;
    top: calc(100% - 32px);
    left: calc(50% - 32px);
    svg {
      width: 60px;
      height: 60px;
    }
  }
`;
