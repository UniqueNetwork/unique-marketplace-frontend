import { Heading } from 'components/UI';
import React from 'react';
import styled from 'styled-components';

interface CollectionHeaderProps {
  name: string;
  description: string;
}

const HeadingStyled = styled(Heading)`
  margin-bottom: 16px !important;
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 28px;
  color: var(--color-secondary-500);
`;

const HeadingWrapper = styled.div`
  margin-bottom: 40px;
`;

const CollectionHeader: React.FC<CollectionHeaderProps> = ({ name, description }) => {
  return (
    <HeadingWrapper>
      <HeadingStyled size='1'>{name}</HeadingStyled>
      <Description>{description}</Description>
    </HeadingWrapper>
  );
};

export default CollectionHeader;
