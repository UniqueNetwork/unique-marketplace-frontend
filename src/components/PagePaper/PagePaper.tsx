import React, { FC } from 'react';
import styled from 'styled-components';
import { AdditionalLight } from '../../styles/colors';

export const PagePaper: FC<{ className?: string }> = ({ children, className = '' }) => {
  return (
    <PagePaperWrapper className={className}>
      {children}
    </PagePaperWrapper>
  );
};

const PagePaperWrapper = styled.div`
  background: ${AdditionalLight};
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  border-radius: 4px;
  padding: calc(var(--gap) * 2);
  flex: 1;

  @media (max-width: 1024px) {
    background: ${AdditionalLight};
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
`;
