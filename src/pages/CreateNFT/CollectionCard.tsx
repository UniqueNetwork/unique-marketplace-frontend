import { VFC, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import clockGrayLight from 'static/icons/clock-gray-light.svg';
import { CollectionCover } from './components/CollectionCover';
import { GQLCollection } from 'api/scanApi/types';
import { useApi } from 'hooks/useApi';
import { timeDifference } from 'utils/timestampUtils';
import { Heading, Icon, Text } from 'components/UI';

interface CollectionCardProps extends GQLCollection {
  timestamp?: number;
  onClick: () => void;
}

export const CollectionCard: VFC<CollectionCardProps> = ({
  cover,
  id: collectionId,
  creationDate,
  name,
  timestamp,
  tokensCount: tokensCount,
  onClick
}) => {
  const createdTimeDiff = timeDifference(creationDate * 1000, timestamp);

  return (
    <CollectionCardLink onClick={onClick}>
      <CollectionCover
        collectionId={collectionId}
        collectionName={name}
        coverSrc={cover}
      />
      <CollectionInfo>
        <CollectionNameWrapper>
          <TextHeader>{name}</TextHeader>
        </CollectionNameWrapper>
        <CollectionProperties>
          <span>
            <IconText>ID</IconText>
            <Text size='s' weight='light'>
              {collectionId.toString()}
            </Text>
          </span>
          <span>
            <StyledSVGIcon size={16} name='empty-image' />
            <Text size='s' weight='light'>
              {tokensCount}
            </Text>
          </span>
          <span>
            <ImageStyled src={clockGrayLight} />
            <Text size='s' weight='light'>
              {createdTimeDiff}
            </Text>
          </span>
        </CollectionProperties>
      </CollectionInfo>
    </CollectionCardLink>
  );
};

const StyledSVGIcon = styled(Icon)`
  color: var(--color-blue-grey-400);
  width: 16px;
`;

const CollectionNameWrapper = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CollectionCardLink = styled.div`
  background: var(--color-additional-light);
  border: 1px solid var(--color-blue-grey-200);
  border-radius: var(--prop-gap);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-direction: column;
  column-gap: var(--prop-gap);

  &:hover {
    transform: translate(0, -5px);
    text-decoration: none;
  }

  .unique-font-heading.size-4 {
    overflow: hidden;
    word-break: break-word;
    font-weight: 500;
    font-size: 18px;
    line-height: 26px;
    text-align: center;

    &:hover {
      color: var(--primary-500);
    }
  }
`;

const CollectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 0;
  width: calc(100% - (16px * 3));
  padding: calc(16px * 1.5);
  padding-top: 48px;

  @media (max-width: 767px) {
    padding: 16px;
    padding-top: 32px;
  }
`;

const CollectionProperties = styled.div`
  display: flex;
  column-gap: 16px;
  margin-bottom: calc(16px / 4);

  span {
    display: flex;
    column-gap: 6px;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 13px;
  }
`;

const IconText = styled.div`
  color: var(--color-blue-grey-400);
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  margin-bottom: 1px;
`;

const ImageStyled = styled.img`
  width: 16px !important;
  height: 16px;
  margin-right: -2px;
`;

const TextHeader = styled.div`
  font-size: 18px;
  line-height: 26px;
  margin-bottom: 8px;
  font-weight: 300;
`;
