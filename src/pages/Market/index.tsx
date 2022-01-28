import styled from 'styled-components';
import { Filters, TokensCard } from '../../components';
import { Token, tokens as gqlTokens } from '../../api/graphQL';
import { useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Select } from '@unique-nft/ui-kit';

export const MarketPage = () => {
  const pageSize = 5;
  const { fetchMoreTokens, isTokensFetching, tokens, tokensCount } = gqlTokens.useGraphQlTokens({
      pageSize
    });

  console.log('tokens', tokens);
  const hasMore = tokens && tokens.length < tokensCount;

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isTokensFetching) {
      fetchMoreTokens({ limit: pageSize, offset: tokens?.length })
        .catch((errMsg) => console.error(errMsg));
    }
  }, [fetchMoreTokens, tokens, isTokensFetching]);

  return (
    <MarketPageStyled>
      <div className='left-column'>
        <Filters />
      </div>
      <div className='main-content'>
        <div className='search-and-sorting'>
          <div>Waiting for a Search Component from ui-kit</div>
          <Select
            onChange={() => { console.log('select changed'); }}
            options={[{ id: 1, title: 'Listing date' }]}
          />
        </div>
        <InfiniteScroll
          hasMore={hasMore}
          initialLoad={false}
          loadMore={onClickSeeMore}
          pageStart={1}
          threshold={200}
          useWindow={true}
        >
          <div className='tokens-list'>
            {tokens?.map &&
              tokens.map((token: Token) => (
                <TokensCard
                  {...token}
                  key={`token-${token.token_prefix}-${token.token_id}`}
                />
              ))}
          </div>
        </InfiniteScroll>
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
