import { Heading, Text } from '@unique-nft/ui-kit';
import { FC, ReactChild } from 'react';
import styled from 'styled-components/macro';
import { Picture } from '../../../../components';
import { Token } from '../../../../api/graphQL/tokens/types';
import { Grey300, Grey500 } from '../../../../styles/colors';
import eye from '../../../../static/icons/eye.svg';
import share from '../../../../static/icons/share.svg';
import { Icon } from '../../../../components/Icon/Icon';
import { CollectionsCard } from './Components/CollectionsCard/CollectionsCard';
import { Collection } from '../../../../api/graphQL/collections/types';
import { AttributesBlock } from './Components/AttributesBlock/AttributesBlock';
import { getAttributesToShow } from '../../../../utils/getAttributes';

interface IProps {
  children: ReactChild[];
  token: Token;
  collection: Collection;
}

export const CommonTokenDetail: FC<IProps> = ({ children,
  collection,
  token }) => {
  const { collection_id: collectionId,
    count_of_views: countOfViews,
    data,
    image_path: imagePath,
    owner,
    token_id: tokenId,
    token_prefix } = token;

  const attributesToShow = getAttributesToShow(data);

  return (
    <CommonTokenDetailStyled>
      <div>
        <PictureWrapper>
          <Picture
alt={tokenId.toString()}
src={imagePath}
          />
        </PictureWrapper>
      </div>
      <Description>
        <Heading size={'1'}>{`${token_prefix || ''} #${tokenId}`}</Heading>
        <Row>
          <Text
color='grey-500'
size='m'
          >
            {(countOfViews | 123).toString()}
          </Text>
          <IconWrapper>
            <Icon path={eye} />
          </IconWrapper>
          <Text
color='grey-500'
size='m'
          >
            Share Link
          </Text>
          <IconWrapper>
            <Icon path={share} />
          </IconWrapper>
        </Row>
        <Row>
          <Text
color='grey-500'
size='m'
          >
            Owned by
          </Text>
          <Account>
            IdIcon
            <Text
color='primary-600'
size='m'
            >
              {owner}
            </Text>
          </Account>
        </Row>
        <Text size='s'>Price: 0</Text>
        <Divider />
        {children}
        <Divider />
        <AttributesBlock attributes={attributesToShow} />
        <Divider />
        <CollectionsCard
          avatarSrc={collection?.collection_cover || ''}
          description={collection?.description || ''}
          id={collectionId}
          title={collection?.name || ''}
        />
      </Description>
    </CommonTokenDetailStyled>
  );
};

const CommonTokenDetailStyled = styled.div`
  display: flex;
  width: 100%;

  > div:first-of-type {
    width: 44%;
    margin-right: 32px;
  }
`;

const IconWrapper = styled.div`
  margin-left: 4px;
  margin-right: 16px;

  svg {
    fill: ${Grey500};
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;

  && h1 {
    margin-bottom: 0;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Account = styled.div`
  margin-left: 8px;

  span {
    margin-left: 8px;
  }
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
