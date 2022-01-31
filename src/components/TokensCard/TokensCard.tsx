import { Text } from '@unique-nft/ui-kit';
import { FC, useState } from 'react';
import styled from 'styled-components/macro';
import { Picture } from '..';
import { Token } from '../../api/graphQL/tokens/types';
import { Primary600 } from '../../styles/colors';

export type TTokensCard = {
  token: Token;
};

export const TokensCard: FC<TTokensCard> = ({ token }) => {
  const [tokenImageUrl, setTokenImageUrl] = useState<string>();

  const { collection_id: collectionId,
    collection_name,
    data,
    id,
    image_path,
    owner,
    token_id: tokenId,
    token_prefix } = token;

  return (
    <TokensCardStyled>
      <PictureWrapper>
        <Picture
          alt={tokenId.toString()}
          src={image_path}
        />
      </PictureWrapper>
      <Description>
        <Text
          size='l'
          weight='medium'
        >{`${token_prefix || ''
          } #${tokenId}`}</Text>
        <Text
          color='primary-600'
          size='s'
        >
          {`${collection_name} [id ${collectionId}]`}
        </Text>
        <Text size='s'>Price: 0</Text>
      </Description>
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
`;

const PictureWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: 8px;

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

const Description = styled.div`
  display: flex;
  flex-direction: column;

  span {
    color: ${Primary600};

    &:nth-of-type(2) {
      margin-bottom: 8px;
    }
  }
`;
