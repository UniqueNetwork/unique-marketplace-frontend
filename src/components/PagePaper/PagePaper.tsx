import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { AdditionalLight } from '../../styles/colors';

export const PagePaper: FC<{ className?: string, children: ReactNode }> = ({ children, className = '' }) => {
  return (
    <PagePaperWrapper className={className}>
      {children}
    </PagePaperWrapper>
  );
};

const PagePaperWrapper = styled.div`
  background: ${AdditionalLight};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  padding: calc(var(--prop-gap) * 2);
  flex: 1;

  @media (max-width: 1024px) {
    background: ${AdditionalLight};
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
`;
