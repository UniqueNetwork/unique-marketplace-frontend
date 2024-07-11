import styled from 'styled-components/macro';

interface BlurredCoverProps {
  color?: string;
  coverSrc?: string;
}

export const BlurredCover = styled.div<BlurredCoverProps>`
  background-image: ${(props) => (props.coverSrc ? `url(${props.coverSrc})` : 'none')};
  background-color: ${(props) => props.color};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  filter: blur(calc(16px * 2));
  -webkit-filter: blur(calc(16px * 2));
  -moz-filter: blur(calc(16px * 2));
  -o-filter: blur(calc(16px * 2));
  -ms-filter: blur(calc(16px * 2));
  height: 88px;
  width: 100%;
`;
