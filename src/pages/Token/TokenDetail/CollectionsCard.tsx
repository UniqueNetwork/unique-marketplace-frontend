import { FCC } from 'react';
import styled from 'styled-components';
import { Heading, Text } from 'components/UI';
import noCollections from '../../../static/icons/no-collections.svg';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { Link } from 'react-router-dom';
import { useApi } from 'hooks/useApi';

interface ICollectionsCardProps {
  id: number;
  title: string;
  avatarSrc: string;
  description: string;
  testid?: string;
}

export const CollectionsCard: FCC<ICollectionsCardProps> = ({
  avatarSrc,
  description,
  id,
  title,
  testid
}: ICollectionsCardProps) => {
  const avatarImg = avatarSrc || noCollections;
  const { currentChainId } = useApi();

  const collectionLink = `/${currentChainId?.toLowerCase()}/collection/${id}`;

  return (
    <CollectionsCardStyled to={collectionLink}><>
      <AvatarStyled>
        <CollectionCover size={40} src={avatarImg} type='circle' />
      </AvatarStyled>
      <Content>
        <Heading className='heading' size='4' testid={`${testid}-title`}>
          {`${title} [id ${id}]`}
        </Heading>
        {description && (
          <Text
            className='description'
            color='grey-500'
            size='s'
            testid={`${testid}-description`}
          >
            {description}
          </Text>
        )}
      </Content>
    </></CollectionsCardStyled>
  );
};

const CollectionsCardStyled = styled(Link)`
  display: flex;
  position: relative;
  border-radius: 4px;
  box-sizing: border-box;
  max-width: 1215px;

  && h4 {
    margin-bottom: 0;
  }

  && h4:last-of-type {
    margin-bottom: 4px;
  }
`;

const AvatarStyled = styled.div`
  margin-right: 16px;
  display: flex;
  align-items: center;
  max-height: 60px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

`;
