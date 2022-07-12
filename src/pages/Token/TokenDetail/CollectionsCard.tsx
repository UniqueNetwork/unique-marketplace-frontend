import { FC } from 'react';
import styled from 'styled-components';
import { Heading, Text } from '@unique-nft/ui-kit';
import noCollections from '../../../static/icons/no-collections.svg';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';

interface ICollectionsCardProps {
  id: number;
  title: string;
  avatarSrc: string;
  description: string;
}

export const CollectionsCard: FC<ICollectionsCardProps> = ({
  avatarSrc,
  description,
  id,
  title
}: ICollectionsCardProps) => {
  const avatarImg = avatarSrc || noCollections;
  return (
    <CollectionsCardStyled>
      <AvatarStyled>
        <CollectionCover size={40} src={avatarImg} type='circle' />
      </AvatarStyled>
      <Content>
        <Heading className='heading' size='4'>
          {`${title} [id ${id}]`}
        </Heading>
        {description && (
          <Text className='description' color='grey-500' size='s'>
            {description}
          </Text>
        )}
      </Content>
    </CollectionsCardStyled>
  );
};

const CollectionsCardStyled = styled.div`
  display: flex;
  position: relative;
  border-radius: 4px;
  box-sizing: border-box;
  max-width: 1215px;

  && h4 {
    margin-bottom: 0;
  }

  && h4:last-of-type {
    margin-bottom: 8px;
  }
`;

const AvatarStyled = styled.div`
  margin-right: 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
