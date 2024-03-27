import React, { FC } from 'react';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Icon, Heading } from 'components/UI';
import Icon404 from 'static/icons/404icon.svg';
import Text404 from 'static/icons/404.svg';
import { BlueGrey400 } from '../../styles/colors';

export const Error404: FC = () => {
  return (
    <PagePaperStyled>
      <Content>
        <Icon file={Icon404} size={150}></Icon>
        <ErrorText>
          <Icon file={Text404} size={150}></Icon>
          <HeadingStyled size={'3'}>Page not found</HeadingStyled>
        </ErrorText>
      </Content>
    </PagePaperStyled>
  );
};

const PagePaperStyled = styled(PagePaper)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  display: flex;
  gap: calc(var(--gap) * 3);
  img {
    width: 150px;
    height: 212px;
  }
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: center;
    img {
      width: 112px;
      height: 158px;
    }
  }
`;

const ErrorText = styled.div`
  display: flex;
  flex-direction: column;
  img {
    width: 230px;
    height: 102px;
  }
  @media (max-width: 767px) {
    img {
      width: 176px;
      height: 78px;
    }
  }
`;

const HeadingStyled = styled(Heading)`
  color: ${BlueGrey400};
  margin-top: calc(var(--gap) * 1.5) !important;
`;
