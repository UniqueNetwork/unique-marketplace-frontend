import styled from 'styled-components/macro';
import { Filters, TokensList } from '../../components';
import { tokens as gqlTokens } from '../../api/graphQL';
import { useCallback, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';
import { Secondary400 } from '../../styles/colors';

export const MarketPage = () => {
  const pageSize = 20;
  const { fetchMoreTokens, isTokensFetching, tokens, tokensCount } =
    gqlTokens.useGraphQlTokens({
      pageSize
    });
  const [sortingValue, setSortingValue] = useState<string | number>();
  const [searchValue, setSearchValue] = useState<string | number>();

  const hasMore = tokens && tokens.length < tokensCount;

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isTokensFetching) {
      fetchMoreTokens({ limit: pageSize, offset: tokens?.length }).catch(
        (errMsg) => console.error(errMsg)
      );
    }
  }, [fetchMoreTokens, tokens, isTokensFetching]);

  const handleSearch = () => {
    console.log(`go search ${searchValue}`);
  };

  const sortingOptions = [
    {
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'price-asc',
      title: 'Price'
    },
    {
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'price-desc',
      title: 'Price'
    },
    {
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'token-id-asc',
      title: 'Token ID'
    },
    {
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'token-id-desc',
      title: 'Token ID'
    },
    {
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'listing-date-asc',
      title: 'Listing date'
    },
    {
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'listing-date-desc',
      title: 'Listing date'
    }
  ];

  return (
    <MarketPageStyled>
      <LeftColumn>
        <Filters />
      </LeftColumn>
      <MainContent>
        <SearchAndSorting>
          <Search>
            <InputText
              iconLeft={{ name: 'magnify', size: 16 }}
              onChange={(val) => setSearchValue(val)}
              placeholder='Collection / token'
              value={searchValue}
            ></InputText>
            <Button
              onClick={() => handleSearch()}
              role='primary'
              title='Search'
            />
          </Search>
          <Select
            defaultValue={'listing-date-desc'}
            onChange={(val) => setSortingValue(val)}
            options={sortingOptions}
            value={sortingValue}
          />
        </SearchAndSorting>
        <div>
          <Text size='m'>{`${tokensCount} items`}</Text>
        </div>
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
  flex: 1;

  > div:nth-of-type(2) {
    margin-top: 16px;
    margin-bottom: 32px;
  }
`;

const Search = styled.div`
  display: flex;

  button {
    margin-left: 8px;
  }
`;

const SearchAndSorting = styled.div`
  display: flex;
  justify-content: space-between;
`;
