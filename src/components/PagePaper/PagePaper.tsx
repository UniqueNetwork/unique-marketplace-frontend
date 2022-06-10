import React, { FC } from 'react';
import styled from 'styled-components';
import { BlueGrey100, LightBackground } from '../../styles/colors';
import useBackground from '../../hooks/useBackground';

export const PagePaper: FC = ({ children }) => {
  const backgroundImage = useBackground();
  return (
    <BgPageWrapper backgroundImage={backgroundImage}>
      {children}
    </BgPageWrapper>
  );
};

const PagePaperWrapper = styled.div`
  background: ${LightBackground};
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  border-radius: 4px;
  padding: calc(var(--gap) * 2);
  flex: 1;

  @media (max-width: 1024px) {
    background: ${LightBackground};
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
`;

const BgPageWrapper = styled(PagePaperWrapper)<{ backgroundImage: string | null }>`
  .unique-table-header {
    background: url(${(props) => (props.backgroundImage ? 'transparent' : BlueGrey100)});;
  }
`;
