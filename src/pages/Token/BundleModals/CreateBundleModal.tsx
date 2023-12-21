import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Pagination, Text, useNotifications } from 'components/UI';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
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
import { FeeMessage } from 'components';

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
  const [totalNesting, setTotalNesting] = useState(0);
  const [nestingProgress, setNestingProgress] = useState(1);
  const [totalUnnesting, setTotalUnnesting] = useState(0);
  const [unnestingProgress, setUnnestingProgress] = useState(1);
  const [transferStage, setTransferStage] = useState<'unnesting' | 'nesting' | 'done'>('nesting');
  const { api } = useApi();
  const { error } = useNotifications();

  const { selectedAccount } = useAccounts();

  const { fetchTokens, fetchNestedTokens, isFetching: isFetchingTokens } = useGetTokensForNesting({
    parentToken: token
  });

  const fetch = useCallback(async () => {
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
  }, [api?.collection, api?.nft, token.collectionId, token.tokenId]);

  useEffect(() => {
    if (!api?.collection || !api?.nft) return;
    void fetch();
  }, [api?.collection, api?.nft]);

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
    return Object.values(selectedTokens).filter((token) => !!token).map((token) => token?.file || token?.image);
  }, [selectedTokens]);

  const onSubmut = useCallback(async () => {
    if (!selectedAccount) return;
    setTransferStage('unnesting');
    setUnnestingProgress(0);
    setNestingProgress(0);
    setStagesModalIsVisible(true);
    const nestedIndexes = nestedTokens.map(({ collectionId, tokenId }) => `${collectionId}_${tokenId}`);
    const tokensToNest = Object.values(selectedTokens)
      .filter((token) => !!token && !nestedIndexes.includes(`${token.collectionId}_${token.tokenId}`)) as TokenItem[];

    const tokensToUnnest = nestedTokens.filter((token) => {
      return !selectedTokens[`${token.collectionId}_${token.tokenId}`];
    });

    const parentAddress = Address.nesting.idsToAddress(token.collectionId, token.tokenId);

    setTotalUnnesting(tokensToUnnest.length);
    setTotalNesting(tokensToNest.length);
    if (tokensToNest.length === 0 && tokensToUnnest.length === 0) {
      setStagesModalIsVisible(false);

      return;
    }
    try {
      await api?.nft?.transferTokensBatch(tokensToUnnest.map((token) => ({
          from: parentAddress,
          to: selectedAccount?.address,
          token: {
            collectionId: token.collectionId,
            tokenId: token.tokenId
          },
          amount: 1,
          mode: 'NFT' as CollectionMode
        })),
        {
          account: selectedAccount,
          onSubmittedOne: () => {
            setUnnestingProgress((count) => count + 1);
          }
        });

      setTransferStage('nesting');

      await api?.nft?.transferTokensBatch(tokensToNest.map((token) => ({
          from: selectedAccount?.address,
          to: parentAddress,
          token: {
            collectionId: token.collectionId,
            tokenId: token.tokenId
          },
          amount: 1,
          mode: 'NFT' as CollectionMode
        })), {
          account: selectedAccount,
          onSubmittedOne: () => {
            setNestingProgress((count) => count + 1);
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

  const [fee, setFee] = useState<string>();
  const [isFetchingFee, setIsFetchingFee] = useState(false);

  const getFee = useCallback(async () => {
    if (!api?.nft || !selectedAccount) return;
    setIsFetchingFee(true);
    const nestedIndexes = nestedTokens.map(({ collectionId, tokenId }) => `${collectionId}_${tokenId}`);
    const tokensToNest = Object.values(selectedTokens)
      .filter((token) => !!token && !nestedIndexes.includes(`${token.collectionId}_${token.tokenId}`)) as TokenItem[];

    const tokensToUnnest = nestedTokens.filter((token) => {
      return !selectedTokens[`${token.collectionId}_${token.tokenId}`];
    });
    let fee = 0;
    const parentAddress = Address.nesting.idsToAddress(token.collectionId, token.tokenId);
    if (tokensToUnnest.length > 0) {
      const feeResponse = await api?.nft?.getUnnestFee(
        tokensToUnnest[0].collectionId,
        tokensToUnnest[0].tokenId,
        parentAddress,
        'NFT',
        1,
        { account: selectedAccount }
      );
      fee = Number(feeResponse) * tokensToUnnest.length;
    }

    if (tokensToNest.length > 0) {
      const feeResponse = await api?.nft?.getTransferToBundleFee(
        selectedAccount.address,
        {
          collectionId: tokensToNest[0].collectionId,
          tokenId: tokensToNest[0].tokenId
        },
        {
          collectionId: token.collectionId,
          tokenId: token.tokenId
        },
        'NFT',
        1,
        { account: selectedAccount }
      );
      fee = Number(feeResponse) * tokensToNest.length;
    }
    setFee(fee.toFixed(4));
    setIsFetchingFee(false);
  }, [api?.nft, nestedTokens, selectedAccount, selectedTokens, token.collectionId, token.tokenId]);

  useEffect(() => {
    void getFee();
  }, [selectedTokens]);

  if (!token) return null;

  return (<>
    <Content>
      <Heading size='2'>Customize</Heading>
    </Content>
    <CreateBundleModalWrapper>
      <NestingWrapper>
        <TokenWrapper>
          <TokenMediaWrapper>
            <TokensMedia imageUrl={(token as TokenByIdResponse).file || (token as TokenByIdResponse).image} testid={''} />
            {images.map((image) => <TokensMedia key={image?.ipfsCid} imageUrl={image} testid={'bundle-token-image'} />)}
          </TokenMediaWrapper>
          <Text
            size='l'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {`${collection?.tokenPrefix} #${token.tokenId}`}
          </Text>
          <Text
            size='m'
            color='primary-500'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {`${collection?.name}`}
          </Text>
        </TokenWrapper>
        <EquipsSection>
          {/* <FilterWrapper>
            <SearchField
              searchValue={searchText}
              onSearchStringChange={setSearchText}
              onSearch={onSearch}
            />
          </FilterWrapper> */}
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
        <FeeMessage isFeeLoading={isFetchingFee} fee={fee || ''} testid={''}/>
        <Button role='primary' title='Save' onClick={onSubmut} />
        <Button role='outlined' title='Cancel' onClick={onFinish} />
      </ActionsWrapper>
      {(isFetching || isFetchingTokens || stagesModalIsVisible) && <LoaderWrapper><Loader /></LoaderWrapper>}
    </CreateBundleModalWrapper>
    <StatusTransactionModal
      isVisible={stagesModalIsVisible}
      totalNesting={totalNesting}
      totalUnnesting={totalUnnesting}
      nestingProgress={nestingProgress}
      unnestingProgress={unnestingProgress}
      stage={transferStage}
      onComplete={() => {
        setStagesModalIsVisible(false);
        onFinish();
      }}
      onContinue={() => {
        setStagesModalIsVisible(false);
        fetch();
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
  align-items: center;
`;

const TokenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap) / 2);
`;

const TokenMediaWrapper = styled.div`
  display: flex;

  width: 400px;
  height: 450px;
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
