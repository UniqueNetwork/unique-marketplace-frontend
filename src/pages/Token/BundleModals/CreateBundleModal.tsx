import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Pagination, Text, useNotifications } from 'components/UI';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse, TokenId } from '@unique-nft/sdk';
import { TBundleTransferModalBodyProps } from './BundleTrunsferModal';
import styled from 'styled-components';
import { useApi } from 'hooks/useApi';
import { Heading, Loader } from '@unique-nft/ui-kit';
import { TokensCard } from './components/TokenCard';
import { TokensMedia } from './components/TokenMedia';
import { useGetTokensForNesting } from './hooks/useGetTokensForNesting';
import { TokenItem } from '../types';
import SearchField from 'components/SearchField/SearchField';
import { StatusTransactionModal } from './components/StatusTransactionModal';
import { Address } from '@unique-nft/utils';
import { useAccounts } from 'hooks/useAccounts';
import { CollectionMode } from 'api/chainApi/types';

export const CreateBundleModal = ({ token, onFinish, testid }: TBundleTransferModalBodyProps) => {
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [tokens, setTokens] = useState<(TokenItem & { selected?: boolean })[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [nestedTokens, setNestedTokens] = useState<TokenItem[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<Record<string, TokenItem | undefined>>({});
  const [searchText, setSearchText] = useState<string>();
  const [page, setPage] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [stagesModalIsVisible, setStagesModalIsVisible] = useState(false);
  const [transfersCount, setTransfersCount] = useState(0);
  const [currentTransfer, setCurrentTransfer] = useState(1);
  const [transferStage, setTransferStage] = useState<'nesting' | 'done'>('nesting');
  const { api } = useApi();
  const { error } = useNotifications();

  const { selectedAccount } = useAccounts();

  const { fetchTokens, fetchNestedTokens, isFetching: isFetchingTokens } = useGetTokensForNesting({
    parentToken: token
  });

  useEffect(() => {
    void (async () => {
      if (!api?.collection || !api?.nft) return;
      setIsFetching(true);
      const collection = await api.collection.getCollection(token?.collectionId);

      setCollection(collection);

      const nestedTokens = await fetchNestedTokens();
      setNestedTokens(nestedTokens);
      const [tokens, total] = await fetchTokens({
        page: 0,
        restrictedCollections: collection?.permissions?.nesting?.restricted,
        nestedTokens
      });

      setTokens(tokens);
      setTotal(total);
      setSelectedTokens(nestedTokens.reduce<Record<string, TokenItem>>((acc, _token) => {
        if (_token.parent === `${token.collectionId}_${token.tokenId}`) {
          acc[`${_token.collectionId}_${_token.tokenId}`] = _token;
        }
        return acc;
       }, {}));
      setIsFetching(false);
    })();
  }, [api?.collection, api?.nft, token.collectionId, token.tokenId]);

  const onSelectTokens = useCallback((token) => (value: boolean) => {
    if (!value) {
      setSelectedTokens((tokens) => {
        return { ...tokens,
          [`${token.collectionId}_${token.tokenId}`]: undefined };
      });
    } else {
      setSelectedTokens((tokens) => ({
        ...tokens,
        [`${token.collectionId}_${token.tokenId}`]: token
      }));
    }
  }, []);

  const images = useMemo(() => {
    return Object.values(selectedTokens).filter((token) => !!token).map((token) => token?.image);
  }, [selectedTokens]);

  const onSubmut = useCallback(async () => {
    if (!selectedAccount) return;
    setTransferStage('nesting');
    setCurrentTransfer(0);
    setStagesModalIsVisible(true);
    const nestedIndexes = nestedTokens.map(({ collectionId, tokenId }) => `${collectionId}_${tokenId}`);
    const tokensToNest = Object.values(selectedTokens)
      .filter((token) => !!token && !nestedIndexes.includes(`${token.collectionId}_${token.tokenId}`)) as TokenItem[];

    const tokensToUnnest = nestedTokens.filter((token) => {
      return !selectedTokens[`${token.collectionId}_${token.tokenId}`];
    });

    const parentAddress = Address.nesting.idsToAddress(token.collectionId, token.tokenId);

    const transfers = [
      ...tokensToUnnest.map((token) => ({
        from: parentAddress,
        to: selectedAccount?.address,
        token: {
          collectionId: token.collectionId,
          tokenId: token.tokenId
        },
        amount: 1,
        mode: 'NFT' as CollectionMode
      })),
      ...tokensToNest.map((token) => ({
        from: selectedAccount?.address,
        to: parentAddress,
        token: {
          collectionId: token.collectionId,
          tokenId: token.tokenId
        },
        amount: 1,
        mode: 'NFT' as CollectionMode
      }))
    ];
    console.log(tokensToNest, tokensToUnnest);
    setTransfersCount(transfers.length);
    if (transfers.length === 0) {
      setStagesModalIsVisible(false);

      return;
    }
    try {
      await api?.nft?.transferTokensBatch(transfers, {
        account: selectedAccount,
        onSubmittedOne: () => {
          setCurrentTransfer((count) => count + 1);
        }
      });
    } catch (e: any) {
      error(e.message);
      setStagesModalIsVisible(false);
    }
    setTransferStage('done');
  }, [selectedAccount, nestedTokens, selectedTokens, token.collectionId, token.tokenId, api?.nft]);

  const onPageChange = useCallback(async (page: number) => {
    setPage(page);
    const [tokens, total] = await fetchTokens({
      page,
      searchText,
      restrictedCollections: collection?.permissions?.nesting?.restricted,
      nestedTokens
    });

    setTokens(tokens);
    setTotal(total);
  }, [collection?.permissions?.nesting?.restricted, fetchTokens, searchText, nestedTokens]);

  const onSearch = useCallback(async (searchText: string) => {
    setPage(0);
    setSearchText(searchText);
    const [tokens, total] = await fetchTokens({
      page: 0,
      searchText,
      restrictedCollections: collection?.permissions?.nesting?.restricted,
      nestedTokens
    });

    setTokens(tokens);
    setTotal(total);
  }, [collection?.permissions?.nesting?.restricted, fetchTokens, nestedTokens]);

  if (!token) return null;

  return (<>
    <Content>
      <Heading size='2'>Customize</Heading>
    </Content>
    <CreateBundleModalWrapper>
      <NestingWrapper>
        <TokenWrapper>
          <TokensMedia imageUrl={(token as TokenByIdResponse).file} testid={''} />
          {images.map((image) => <TokensMedia key={image?.ipfsCid} imageUrl={image} testid={''} />)}
          <Text
            size='l'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {`${collection?.tokenPrefix} #${token.tokenId}`}
          </Text>
        </TokenWrapper>
        <EquipsSection>
          <FilterWrapper>
            <SearchField
              searchValue={searchText}
              onSearchStringChange={setSearchText}
              onSearch={onSearch}
            />
          </FilterWrapper>
          <EquipsListWrapper>
            {tokens.map((token) => <TokensCard
              testid={''}
              key={`${token?.tokenId}_${token?.collectionId}`}
              token={token}
              isChecked={!!selectedTokens[`${token.collectionId}_${token.tokenId}`]}
              onCheck={onSelectTokens(token)}
            />)}
          </EquipsListWrapper>
          {total > 21 && <Pagination
            size={total}
            perPage={21}
            current={page}
            onPageChange={onPageChange}
          />}
        </EquipsSection>
      </NestingWrapper>
      <ActionsWrapper>
        <Button role='primary' title='Save' onClick={onSubmut} />
        <Button role='outlined' title='Cancel' onClick={onFinish} />
      </ActionsWrapper>
      {(isFetching || isFetchingTokens || stagesModalIsVisible) && <LoaderWrapper><Loader /></LoaderWrapper>}
    </CreateBundleModalWrapper>
    <StatusTransactionModal
      isVisible={stagesModalIsVisible}
      totalTokens={transfersCount}
      current={currentTransfer}
      stage={transferStage}
      onComplete={() => {
        setStagesModalIsVisible(false);
        onFinish();
      }}
      onContinue={() => {
        setStagesModalIsVisible(false);
      } }
    />
  </>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;

const CreateBundleModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
`;

const NestingWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--gap);
`;

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--gap);
  justify-content: flex-end;
`;

const TokenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  width: 250px;
  height: 300px;
  padding-top: 258px;
  position: relative;
  &>div {
    position: absolute;
    top: 0;
  }
`;

const EquipsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
`;

const FilterWrapper = styled.div`
  height: 42px;
`;

const EquipsListWrapper = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr 1fr;
  min-width: 500px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
  height: 100%;
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.7);
`;
