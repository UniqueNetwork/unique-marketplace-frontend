import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Text } from 'components/UI';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse, TokenId } from '@unique-nft/sdk';
import { TBundleTransferModalBodyProps } from './BundleTrunsferModal';
import styled from 'styled-components';
import { useApi } from 'hooks/useApi';
import { Heading, Loader } from '@unique-nft/ui-kit';
import { TokensCard } from './components/TokenCard';
import { TokensMedia } from './components/TokenMedia';
import { useGetTokensForNesting } from './hooks/useGetTokensForNesting';
import { TokenItem } from '../types';

export const CreateBundleModal = ({ token, onFinish, testid }: TBundleTransferModalBodyProps) => {
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const { api } = useApi();

  const { fetchTokens, isFetching: isFetchingTokens } = useGetTokensForNesting({
    parentToken: token
  });

  useEffect(() => {
    void (async () => {
      if (!api?.collection || !api?.nft) return;
      setIsFetching(true);
      const collection = await api.collection.getCollection(token?.collectionId);

      setCollection(collection);

      const tokens = await fetchTokens(collection?.permissions?.nesting?.restricted);

      setTokens(tokens);
      setSelectedTokens(tokens.reduce<number[]>((acc, { parent }, index) => {
        if (parent === `${token.collectionId}_${token.tokenId}`) {
          acc.push(index);
        }
        return acc;
       }, []));
      setIsFetching(false);
    })();
  }, [api?.collection, api?.nft, token.collectionId, token.image.fullUrl, token.tokenId]);

  const onSelectTokens = useCallback((tokenId) => (value: boolean) => {
    if (!value) {
      setSelectedTokens((tokens) => tokens.filter((id) => id !== tokenId));
    } else {
      setSelectedTokens((tokens) => [...tokens, tokenId]);
    }
  }, []);

  const images = useMemo(() => {
    return tokens.filter((_, index) => selectedTokens.includes(index)).map((token) => token?.image);
  }, [tokens, selectedTokens]);

  if (!token) return null;

  return (<>
    <Content>
      <Heading size='2'>Customize</Heading>
    </Content>
    <CreateBundleModalWrapper>
      <NestingWrapper>
        <TokenWrapper>
          <TokensMedia imageUrl={(token as TokenByIdResponse).file} testid={''} />
          {images.map((image, index) => <TokensMedia key={index} imageUrl={image} testid={''} />)}
          <Text
            size='l'
            weight='regular'
            testid={`${testid}-tokenId`}
          >
            {`${collection?.tokenPrefix} #${token.tokenId}`}
          </Text>
        </TokenWrapper>
        <EquipsWrapper>
          {tokens.map((token, index) => <TokensCard
            testid={''}
            key={`${token?.tokenId}_${token?.collectionId}`}
            token={token}
            isChecked={selectedTokens.includes(index)}
            onCheck={onSelectTokens(index)}
          />)}
        </EquipsWrapper>
      </NestingWrapper>
      <ActionsWrapper>
        <Button role='primary' title='Save' />
        <Button role='outlined' title='Cancel' onClick={onFinish} />
      </ActionsWrapper>
      {(isFetching || isFetchingTokens) && <LoaderWrapper><Loader /></LoaderWrapper>}
    </CreateBundleModalWrapper>
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

const EquipsWrapper = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr 1fr;
  min-width: 500px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
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
