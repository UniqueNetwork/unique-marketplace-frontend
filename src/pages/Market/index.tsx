import styled from 'styled-components/macro';
import { Filters, TokensList } from '../../components';
import { tokens as gqlTokens } from '../../api/graphQL';
import { useCallback, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Select, Text } from '@unique-nft/ui-kit';

export const MarketPage = () => {
  const pageSize = 5;
  const { fetchMoreTokens, isTokensFetching, tokens, tokensCount } = gqlTokens.useGraphQlTokens({
    pageSize
  });
  const [sortingValue, setSortingValue] = useState<string | number>();

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
      <LeftColumn>
        <Filters />
      </LeftColumn>
      <MainContent>
        <SearchAndSorting>
          <div>
            <div>Waiting for a Search Component from ui-kit</div>
            <Select
              defaultValue={1}
              onChange={(val) => setSortingValue(val)}
              options={[{ iconRight: { name: 'triangle', size: 16 }, id: 1, title: 'Listing date' }]}
              value={sortingValue}
            />
          </div>
          <div><Text size='m'>{`${tokensCount} items`}</Text></div>
        </SearchAndSorting>
        <InfiniteScroll
          hasMore={hasMore}
          initialLoad={false}
          loadMore={onClickSeeMore}
          pageStart={1}
          threshold={200}
          useWindow={true}
        >
          <TokensList tokens={tokens || []} />
        </InfiniteScroll>
      </MainContent>
    </MarketPageStyled>
  );
};

const MarketPageStyled = styled.div`
  display: flex;
`;

const LeftColumn = styled.div`
    height: 500px;
    padding-right: 24px;
    border-right: 1px solid grey;
`;

const MainContent = styled.div`
     padding-left: 32px;
     flex:1;
     >div:nth-of-type(2){
       margin:32px 0;
     }
`;

const SearchAndSorting = styled.div`
     display: flex;
     flex-direction: column;
     
     >div:first-of-type{
       display: flex;
       justify-content: space-between;
     }
`;
