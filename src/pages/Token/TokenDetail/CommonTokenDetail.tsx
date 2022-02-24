import { Heading, Text } from '@unique-nft/ui-kit';
import { FC, ReactChild } from 'react';
import styled from 'styled-components/macro';

import { Picture } from '../../../components';
import { Grey300, Grey500 } from '../../../styles/colors';
import eye from '../../../static/icons/eye.svg';
import share from '../../../static/icons/share.svg';
import { Icon } from '../../../components/Icon/Icon';
import { CollectionsCard } from './CollectionsCard';
import { AttributesBlock } from './AttributesBlock';
import { NFTToken } from '../../../api/chainApi/unique/types';

interface IProps {
  children: ReactChild;
  token: NFTToken;
}

export const CommonTokenDetail: FC<IProps> = ({
  children,
  token
}) => {
  const {
    collectionId,
    collectionName,
    description,
    attributes,
    imageUrl,
    owner,
    id: tokenId,
    prefix
  } = token;

  return (
    <CommonTokenDetailStyled>
      <div>
        <PictureWrapper>
          <Picture alt={tokenId.toString()} src={imageUrl} />
        </PictureWrapper>
      </div>
      <Description>
        <Heading size={'1'}>{`${prefix || ''} #${tokenId}`}</Heading>
        <Row>
          <Text color='grey-500' size='m'>
            {(123).toString()}
          </Text>
          <IconWrapper>
            <Icon path={eye} />
          </IconWrapper>
          <Text color='grey-500' size='m'>
            Share Link
          </Text>
          <IconWrapper>
            <Icon path={share} />
          </IconWrapper>
        </Row>
        <Row>
          <Text color='grey-500' size='m'>
            Owned by
          </Text>
          <Account>
            IdIcon
            <Text color='primary-600' size='m'>
              {owner?.Substrate || ''}
            </Text>
          </Account>
        </Row>
        <Divider />
        {children}
        <AttributesBlock attributes={attributes} />
        <Divider />
        <CollectionsCard
          avatarSrc={''}
          description={description || ''}
          id={collectionId || -1}
          title={collectionName || ''}
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
    content: '';
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
