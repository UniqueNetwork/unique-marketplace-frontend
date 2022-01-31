import { FC, useState } from 'react';
import styled from 'styled-components/macro';
import { TokensCard } from '..';
import { Token } from '../../api/graphQL/tokens/types';

type TTokensList = {
    tokens: Token[]
}

export const TokensList: FC<TTokensList> = ({ tokens }) => {
    return (
        <TokensListStyled>
            {tokens?.map &&
                tokens.map((token: Token) => (
                    <TokensCard
                        key={`token-${token.token_prefix}-${token.token_id}`}
                        token={token}
                    />
                ))}
        </TokensListStyled>
    );
};

const TokensListStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 32px;
  @media (max-width: 1919px){
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @media (max-width: 1439px){
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (max-width: 1023px){
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 768px){
    grid-template-columns: 1fr;
  }
  @media (max-width: 567px){
    display: flex;
    flex-direction: column;
  }
`;
