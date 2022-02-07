import styled from 'styled-components/macro';
import { Filters, TokensList } from '../../components';
import { Token, tokens as gqlTokens } from '../../api/graphQL';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';
import { Secondary400 } from '../../styles/colors';
import { gqlClient } from '../../api';
import config from '../../config';

const { defaultChain } = config;

type TOption = {
  direction: 'asc' | 'desc';
  field: keyof Token;
  iconRight: {
      color: string;
      name: string;
      size: number;
  };
  id: string;
  title: string;
}

export const MarketMainPage = () => {
  const pageSize = 6;
  const [sortingValue, setSortingValue] = useState<string | number>();
  const [searchValue, setSearchValue] = useState<string | number>();
  const [selectOption, setSelectOption] = useState<TOption>();
  const { fetchMoreTokens, isTokensFetching, tokens, tokensCount } =
  gqlTokens.useGraphQlTokens({
    pageSize, sorting: selectOption ? { direction: selectOption?.direction, field: selectOption?.field } : undefined
  });

  useEffect(() => {
    const option = sortingOptions.find((option) => { return option.id === sortingValue; });

    setSelectOption(option);
  }, [sortingValue, setSelectOption]);

  console.log('selectOption', selectOption);

  const hasMore = tokens && tokens.length < tokensCount;

  const onClickSeeMore = useCallback(() => {
    // Todo: fix twice rendering
    if (!isTokensFetching) {
      fetchMoreTokens({ limit: pageSize, offset: tokens?.length }).catch(
        (errMsg) => console.error(errMsg)
      );
    }
  }, [fetchMoreTokens, tokens, isTokensFetching]);

  const onSortingChange = useCallback((val) => {
    console.log('value', val);
    setSortingValue(val);
    gqlClient.changeEndpoint(defaultChain.gqlEndpoint);
  }, [defaultChain]);

  const handleSearch = () => {
    console.log(`go search ${searchValue}`);
  };

  const sortingOptions: TOption[] = [
    {
      direction: 'asc',
      field: 'collection_id',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'price-asc',
      title: 'Price'
    },
    {
      direction: 'desc',
      field: 'collection_id',
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'price-desc',
      title: 'Price'
    },
    {
      direction: 'asc',
      field: 'token_id',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'token-id-asc',
      title: 'Token ID'
    },
    {
      direction: 'desc',
      field: 'token_id',
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'token-id-desc',
      title: 'Token ID'
    },
    {
      direction: 'asc',
      field: 'collection_name',
      iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
      id: 'listing-date-asc',
      title: 'Listing date'
    },
    {
      direction: 'desc',
      field: 'collection_name',
      iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
      id: 'listing-date-desc',
      title: 'Listing date'
    }
  ];

  return (
    <MarketMainPageStyled>
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
            onChange={onSortingChange}
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
    </MarketMainPageStyled>
  );
};

const MarketMainPageStyled = styled.div`
  display: flex;
  flex: 1;
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
