import React, { FC, useMemo, useState } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { useApi } from 'hooks/useApi';
import { Primary600 } from 'styles/colors';
import { TokenTypeEnum } from 'pages/MyTokens/types';
import { TokensMedia } from './TokenMedia';
import { Checkbox } from 'components/UI';
import { TokenItem } from '../../types';

export type TTokensCard = {
  token?: TokenItem
  tokenId?: number
  collectionId?: number
  tokenImageUrl?: string
  testid: string
  showOwner?: boolean
  isChecked?: boolean
  onCheck?: (checked: boolean) => void
};

export const TokensCard: FC<TTokensCard> = ({ collectionId, tokenId, testid, showOwner, isChecked, onCheck, ...props }) => {
  const [token] = useState<TokenItem | undefined>(props.token);

  const { api } = useApi();

  const {
    tokenTitle,
    imageUrl,
    collectionName
  } = useMemo(() => {
    if (token) {
      const { image, tokenName, collectionName } = token || {};
      return {
        tokenTitle: tokenName,
        imageUrl: image,
        type: TokenTypeEnum.NFT,
        collectionName
      };
    }
    return {};
  }, [collectionId, tokenId, token, api]);

  return (
    <TokensCardStyled onClick={() => onCheck?.(!isChecked)}>
      <CheckboxStyled
        checked={!!isChecked}
        label={''}
        testid={''}
      />
      <TokensMedia
        tokenId={tokenId}
        imageUrl={imageUrl}
        testid={`${testid}-token-media`}
      />
      <Description>
        <BasicDataWrapper>
          <Text
            size='l'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {tokenTitle}
          </Text>
          <Text color='primary-600' size='s'>
            {collectionName}
          </Text>
        </BasicDataWrapper>
      </Description>
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  cursor: pointer;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--prop-border-radius);
  height: fit-content;
  &:hover {
    box-shadow: 1 1 2 var(--prop-shadow);
  }
`;

const BasicDataWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - var(--gap));
  padding: 0 calc(var(--gap) / 2) calc(var(--gap) / 2);
  span {
    color: ${Primary600};
  }
`;

const CheckboxStyled = styled(Checkbox)`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
`;
