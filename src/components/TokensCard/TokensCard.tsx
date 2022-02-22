import { Text } from '@unique-nft/ui-kit';
import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components/macro';
import { useNavigate } from 'react-router-dom';
import { Picture } from '..';
import { Primary600 } from '../../styles/colors';
import { useApi } from '../../hooks/useApi';
import Loading from '../Loading';
import { NFTToken } from "../../api/chainApi/unique/types";

export type TTokensCard = {
  token?: NFTToken
  tokenId?: number
  collectionId?: number
  price?: string
  tokenImageUrl?: string
};

export const TokensCard: FC<TTokensCard> = ({ collectionId, tokenId, price, tokenImageUrl, ...props }) => {
  const [token, setToken] = useState<NFTToken | undefined>(props.token);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { api } = useApi();

  const {
    collectionName,
    imagePath,
    tokenPrefix
  } = useMemo<Record<string, any>>(() => {
    if (token) {
      return {
        collectionName: token.collectionName,
        imagePath: token.imageUrl,
        tokenPrefix: token.prefix
      };
    }

    if (tokenId && collectionId) {
      setIsFetching(true);
      void api?.nft?.getToken(collectionId, tokenId).then((token) => {
        setIsFetching(false);
        setToken(token);
      });
    }
    return {};
  }, [collectionId, tokenId, token, api]);

  const navigate = useNavigate();

  const navigateToTokenPage = useCallback(() => {
    navigate(`token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [collectionId, navigate, tokenId]);

  return (
    <TokensCardStyled onClick={navigateToTokenPage}>
      <PictureWrapper>
        <Picture alt={tokenId?.toString() || ''} src={imagePath} />
      </PictureWrapper>
      <Description>
        <Text size='l' weight='medium'>{`${
          tokenPrefix || ''
        } #${tokenId}`}</Text>
        <Text color='primary-600' size='s'>
          {`${collectionName?.substring(0, 15) || ''} [id ${collectionId || ''}]`}
        </Text>
        <Text size='s'>{`Price: ${price}`}</Text>
      </Description>

      {isFetching && <Loading />}
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const PictureWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
