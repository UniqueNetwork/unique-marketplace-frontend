import styled from 'styled-components';
import { TokensCard } from '../../components';
import { Token, tokens as gqlTokens } from '../../api/graphQL';
import { Button } from '@unique-nft/ui-kit';
import { useCallback } from 'react';

const MarketPage = () => {
  const pageSize = 10;
  const { fetchMoreTokens, tokens, tokensCount } = gqlTokens.useGraphQlTokens({
    pageSize
  });

  const onClickSeeMore = useCallback(() => {
    fetchMoreTokens({ limit: pageSize })
      .catch((errMsg) => console.error(errMsg));
  }, [fetchMoreTokens]);

  return (
    <MarketPageStyled>
      <div className='left-column'>Filters</div>
      <div className='main-content'>
        cards
        {tokens?.map &&
          tokens.map((token: Token) => (
            <TokensCard
              {...token}
              key={`token-${token.token_prefix}-${token.token_id}`}
            />
          ))}

        <Button
          onClick={onClickSeeMore}
          role='outlined'
          title='see more'
        />
      </div>
    </MarketPageStyled>
  );
};

const MarketPageStyled = styled.div`
  display: flex;

  .left-column {
    height: 500px;
    padding-right: 24px;
    border-right: 1px solid grey;
  }

  .main-content {
    padding: 0 24px;
  }
`;

export default MarketPage;
