import React, { useState } from 'react';
import styled from 'styled-components';
import { Heading } from 'components/UI';

interface CollectionHeaderProps {
  name: string;
  description: string;
}

const HeadingStyled = styled(Heading)`
  margin-bottom: 16px !important;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 24px;
  color: var(--color-secondary-500);
  display: inline; /* Keep description inline */
`;

const HeadingWrapper = styled.div`
  margin-bottom: 40px;
`;

const Blue = styled.span`
  margin-left: 8px;
  color: var(--color-primary-500);
  cursor: pointer;
  font-size: 16px;
  line-height: 24px;
  display: inline;
`;

const CollectionHeader: React.FC<CollectionHeaderProps> = ({ name, description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const maxLength = 40;

  const truncatedDescription = !isExpanded && description.length > maxLength
    ? `${description.slice(0, maxLength)}...`
    : description;

  return (
    <HeadingWrapper>
      <HeadingStyled size='1'>{name}</HeadingStyled>
      <Description>
        {truncatedDescription}
        {description.length > maxLength && (
          <Blue onClick={toggleExpanded}>
            {isExpanded ? ' Show less' : ' Show more'}
          </Blue>
        )}
      </Description>
    </HeadingWrapper>
  );
};

export default CollectionHeader;
