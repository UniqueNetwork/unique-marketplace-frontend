/* eslint-disable react/jsx-no-bind */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link, Suggest, SuggestProps } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import styled from 'styled-components';

import DefaultMarketStages from '../Modals/StagesModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { TBundleTrunsferModalBodyProps } from './BundleTrunsferModal';
import { useCollections } from 'hooks/useCollections';
import { useApi } from 'hooks/useApi';
import { CollectionInfoWithSchema, DecodedInfixOrUrlOrCidAndHash, TokenByIdResult, TokenIdArguments } from '@unique-nft/substrate-client/tokens';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { useOffers } from 'api/restApi/offers/offers';
import { useTransferToBundleStages } from 'hooks/marketplaceStages/useTransferToBundleStages';
import { INestingToken } from 'components/BundleTree/types';

const pageSize = 1000;

export const TransferToBundleModal: FC<TBundleTrunsferModalBodyProps> = ({ token, setIsClosable, onFinish, testid }) => {
  const { selectedAccount } = useAccounts();
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask'); // TODO: naming
  const [newParent, setNewParent] = useState<{ collectionId: number, tokenId: number }>();

  const onTransferToBundle = useCallback((newParent: { collectionId: number, tokenId: number }) => {
    setNewParent(newParent);
    setStatus('transfer-stage');
    setIsClosable(false);
  }, [setStatus, setIsClosable]);

  if (!selectedAccount || !token) return null;

  if (status === 'ask') {
    return (<AskTransferToBundleModal token={token} onTransferToBundle={onTransferToBundle} testid={`${testid}-ask-transfer`} />);
  }
  if (status === 'transfer-stage') {
    if (!newParent) return null;
    return (<TransferToBundleStagesModal
      onFinish={onFinish}
      token={token}
      newParent={newParent}
      setIsClosable={setIsClosable}
      testid={testid}
    />);
  }
  return null;
};

type TokenOption = {
  tokenId: number
  collectionId: number
  image: DecodedInfixOrUrlOrCidAndHash
};

type ITokenOption = TokenOption | null;

const AskTransferToBundleModal: FC<{ token: INestingToken, onTransferToBundle(newParent: TokenIdArguments): void, testid: string }> = ({ token, onTransferToBundle, testid }) => {
  const [collection, setCollection] = useState<CollectionInfoWithSchema | null>();
  const [selectedToken, setSelectedToken] = useState<ITokenOption | null>();
  const [tokens, setTokens] = useState<TokenByIdResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedAccount } = useAccounts();
  const { api } = useApi();

  const { offers, fetch } = useOffers();
  const { collections } = useCollections();

  useEffect(() => {
    if (!selectedAccount) return;
    void (async () => {
      setIsLoading(true);
      await fetch({ page: 1, pageSize, seller: selectedAccount?.getAddress() });
      const tokens = await api?.nft?.getAccountMarketableTokens(selectedAccount.getAddress());
      setTokens(tokens || []);
      setIsLoading(false);
    })();
  }, [selectedAccount, api?.nft]);

  const collectionItems = useMemo(() => {
    const myTokensCollectionIds = [...tokens, ...offers].map((token) => token.collectionId);
    return collections.filter((collection) => myTokensCollectionIds.includes(collection.id));
  }, [tokens, offers, collections]);

  const tokenItems: ITokenOption[] = useMemo(() => {
    if (!collection) return [];
    return [
      ...offers.filter(({ collectionId }) => collectionId === collection?.id).map(({ collectionId, tokenId, tokenDescription }) => ({
        collectionId,
        tokenId,
        image: tokenDescription.image
      })),
      ...tokens.filter(({ collectionId }) => collectionId === collection?.id).map(({ collectionId, tokenId, image }) => ({
        collectionId,
        tokenId,
        image
      }))
    ].filter(({ tokenId }) => tokenId !== token.tokenId);
  }, [tokens, offers, collection, token]);

  const onConfirmTransferToBundleClick = useCallback(
    () => {
      if (!selectedToken) return;
      onTransferToBundle({ collectionId: selectedToken?.collectionId, tokenId: selectedToken?.tokenId });
    },
    [onTransferToBundle, selectedToken]
  );

  const onChangeSelectedCollection = useCallback((collection: CollectionInfoWithSchema | null) => {
    setCollection(collection);
    setSelectedToken(null);
  }, []);

  const onChangeSelectedToken = useCallback((token: ITokenOption) => {
    setSelectedToken(token);
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Transfer NFT to bundle</Heading>
      </Content>
      <Row>
        <RowLabel>
          <Text size='m'>Collections</Text>
          <Text size='s' color='grey-500'>A list of collections that can be nested.</Text>
        </RowLabel>
        <CollectionsSuggestStyled
          isLoading={isLoading}
          suggestions={collectionItems}
          getSuggestionValue={(suggestion) => `${suggestion.name} ${suggestion.id}`}
          getActiveSuggestOption={(suggest, activeValue) => suggest.id === activeValue.id}
          components={{
            SuggestItem: ({ suggestion }) => <ItemOption>
              <CollectionCover src={suggestion.schema?.coverPicture.fullUrl || ''} size={24} type={'circle'} />
              <Text>{`${suggestion?.name} [ID ${suggestion?.id}]`}</Text>
            </ItemOption>
          }}
          onChange={onChangeSelectedCollection}
        />
      </Row>
      <Row>
        <RowLabel>
          <Text size='m'>Parent NFT</Text>
          <Text size='s' color='grey-500'>A token that will become the bundle owner and the root of the nested structure. You can provide only a token that you own.</Text>
        </RowLabel>
        <TokensSuggestStyled
          key={collection?.id}
          isLoading={isLoading}
          suggestions={collection ? tokenItems : []}
          getSuggestionValue={(suggestion) => suggestion?.tokenId?.toString() || ''}
          getActiveSuggestOption={(suggest, activeValue) => suggest?.tokenId === activeValue?.tokenId}
          components={{
            SuggestItem: ({ suggestion }) => <ItemOption>
              <CollectionCover src={suggestion?.image?.fullUrl || ''} size={24} type={'square'} />
              <Text>{`${collection?.tokenPrefix || ''} #${suggestion?.tokenId}`}</Text>
            </ItemOption>
          }}
          onChange={onChangeSelectedToken}
          value={selectedToken}
          inputProps={{
            disabled: !collection
          }}
        />
      </Row>
      <ButtonWrapper>
        <Button
          disabled={!selectedToken}
          onClick={onConfirmTransferToBundleClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );
};

const TransferToBundleStagesModal: FC<TBundleTrunsferModalBodyProps & { newParent: TokenIdArguments }> = ({ token, newParent, onFinish, testid }) => {
  const { stages, status, initiate } = useTransferToBundleStages(token, newParent);
  const { info } = useNotifications();
  const { selectedAccount } = useAccounts();

  useEffect(() => {
    if (!selectedAccount) return;
    initiate(null);
  }, [selectedAccount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${token?.collectionId}/${token?.tokenId}`} title={`${''} #${token?.tokenId}`}/> transfered</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={testid}
      />
    </div>
  );
};

const RowLabel = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
`;

const Row = styled.div`
  margin-bottom: calc(var(--gap) * 1.5); 
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  @media (max-width: 567px) {
    button {
      width: 100%;
    }
  }
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;

const ItemOption = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  cursor: pointer;
  padding: calc(var(--gap) / 2) calc(var(--gap) / 4);
`;

const CollectionsSuggest = (props: SuggestProps<CollectionInfoWithSchema>) => <Suggest<CollectionInfoWithSchema> {...props} />;
const CollectionsSuggestStyled = styled(CollectionsSuggest)`
  width: 100%;
  & .unique-input-text {
    width: 100%;
  }
`;

const TokensSuggest = (props: SuggestProps<ITokenOption>) => <Suggest<ITokenOption> {...props} />;
const TokensSuggestStyled = styled(TokensSuggest)`
  width: 100%;
  & .unique-input-text {
    width: 100%;
  }
`;
