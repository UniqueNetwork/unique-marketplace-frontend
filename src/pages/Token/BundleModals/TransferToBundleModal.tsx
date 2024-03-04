/* eslint-disable react/jsx-no-bind */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link, Suggest, SuggestProps } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import DefaultMarketStages from '../Modals/StagesModal';
import { useAccounts } from 'hooks/useAccounts';
import { StageStatus } from 'types/StagesTypes';
import { TBundleTransferModalBodyProps } from './BundleTransferModal';
import { useApi } from 'hooks/useApi';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { FeeMessage } from 'components';
import { useTransferToBundleStages } from 'hooks/marketplaceStages/useTransferToBundleStages';
import { INestingToken } from 'components/BundleTree/types';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse, TokenIdQuery } from '@unique-nft/sdk';
import { debounce } from 'utils/helpers';
import { fromStringToBnString } from 'utils/bigNum';
import { Coral700 } from 'styles/colors';
import { useGetCollectionsForNesting } from '../hooks/useGetCollectionsForNesting';
import { CollectionItem, TokenItem } from '../types';
import { getIpfsUriByImagePath } from 'utils/urlUtils';
import { useGetAllOwnedTokensByCollection } from '../hooks/useGetAllOwnedTokensByCollection';
import { FractionalAmountInput } from '../Modals/FractionalAmountInput';
import { CollectionMode } from 'api/chainApi/types';

export const TransferToBundleModal: FC<TBundleTransferModalBodyProps> = ({ token, setIsClosable, onFinish, testid }) => {
  const { selectedAccount } = useAccounts();
  const { api } = useApi();
  const [status, setStatus] = useState<'ask' | 'transfer-stage'>('ask'); // TODO: naming
  const [newParent, setNewParent] = useState<{ collectionId: number, tokenId: number }>();
  const [isFetching, setIsFetching] = useState(false);
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    void (async () => {
      if (!api?.collection) return;
      setIsFetching(true);
      const collection = await api.collection.getCollection(token?.collectionId);
      setCollection(collection);
      setIsFetching(false);
    })();
  }, [api?.collection, token?.collectionId]);

  const onTransferToBundle = useCallback((newParent: { collectionId: number, tokenId: number }, amount: number) => {
    setAmount(amount);
    setNewParent(newParent);
    setStatus('transfer-stage');
    setIsClosable(false);
  }, [setStatus, setIsClosable]);

  if (!selectedAccount || !token) return null;

  const owner = token.owner || selectedAccount.address;

  if (status === 'ask') {
    return (<AskTransferToBundleModal
      token={token}
      collection={collection}
      onTransferToBundle={onTransferToBundle}
      testid={`${testid}-ask-transfer`}
    />);
  }
  if (status === 'transfer-stage') {
    if (!newParent) return null;
    return (<TransferToBundleStagesModal
      tokenPrefix={collection?.tokenPrefix || ''}
      owner={owner}
      onFinish={onFinish}
      token={token}
      newParent={newParent}
      mode={collection?.mode || 'NFT'}
      amount={amount}
      setIsClosable={setIsClosable}
      testid={testid}
    />);
  }
  return null;
};

type AskTransferToBundleModalProps = {
  token: INestingToken | TokenByIdResponse,
  collection: CollectionInfoWithSchemaResponse | null
  onTransferToBundle(newParent: TokenIdQuery, amount: number): void
  testid: string
};

const AskTransferToBundleModal: FC<AskTransferToBundleModalProps> = ({ token, collection: collectionProp, onTransferToBundle, testid }) => {
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [fee, setFee] = useState<string>('0');
  const [amount, setAmount] = useState(1);
  const [isAmountValid, setIsAmountValid] = useState(true);

  const { selectedAccount } = useAccounts();
  const { api } = useApi();
  const [isSponsored, setIsSponsored] = useState(false);

  const { collections: collectionItems, fetchCollections, isFetching: isFetchingCollections } = useGetCollectionsForNesting();
  const { tokens, isFetchingTokens } = useGetAllOwnedTokensByCollection(collection?.collectionId, useMemo(() => ({
    excludeTokenId: {
      collectionId: token.collectionId,
      tokenId: token.tokenId
    }
  }), [token]));

  useEffect(() => {
    if (!selectedAccount) return;
    const isSponsored = !!collectionProp?.sponsorship?.isConfirmed;
    setIsSponsored(isSponsored);
    void (async () => {
      await fetchCollections(selectedAccount);
    })();
  }, [selectedAccount, api?.nft, collectionProp]);

  const getFee = useCallback((newParentToken: TokenItem) => {
    setIsFeeLoading(true);
    return debounce(() => {
      if (!api?.market || !token || !selectedAccount || !newParentToken || isSponsored) return setIsFeeLoading(false);

      api?.nft?.getTransferToBundleFee(
        selectedAccount.address,
        { collectionId: token.collectionId, tokenId: token.tokenId },
        { collectionId: newParentToken.collectionId, tokenId: newParentToken.tokenId },
        collectionProp?.mode || 'NFT',
        amount,
        { account: selectedAccount })
      .then((fee) => {
        setFee(fee || '0');
      }).catch((e) => {
        console.error('Failed to get fee: ', e);
      }).finally(() => {
        setIsFeeLoading(false);
      });
    }, 300)();
  }, [api?.market, token, selectedAccount, collectionProp, isSponsored, amount]);

  const onConfirmTransferToBundleClick = useCallback(
    () => {
      if (!selectedToken) return;
      onTransferToBundle({ collectionId: selectedToken?.collectionId, tokenId: selectedToken?.tokenId }, amount);
    },
    [onTransferToBundle, selectedToken, amount]
  );

  const onChangeSelectedCollection = useCallback((collection: CollectionItem | null) => {
    setCollection(collection);
    setSelectedToken(null);
    setFee('0');
  }, []);

  const onChangeSelectedToken = useCallback((token: TokenItem) => {
    setSelectedToken(token);
    getFee(token);
  }, [getFee]);

  const isFeeGreaterThanBalance = useMemo(() => {
    if (!fee || isSponsored) return false;
    const feeBN = new BN(fromStringToBnString(fee));
    return feeBN.gt(selectedAccount?.balances?.proper.raw || new BN(0));
  }, [fee, selectedAccount?.balances?.proper.raw, isSponsored]);

  return (
    <>
      <Content>
        <Heading size='2'>Transfer token to bundle</Heading>
      </Content>
      {collectionProp?.mode === 'ReFungible' && <Row>
        <FractionalAmountInput
          ownerAddress={token?.owner}
          amount={amount}
          collectionId={token?.collectionId}
          tokenId={token?.tokenId}
          onChangeAmount={setAmount}
          onChangeIsAmountValid={setIsAmountValid}
        />
      </Row>}
      <Row>
        <RowLabel>
          <Text size='m'>Collections</Text>
          <Text size='s' color='grey-500'>A list of collections that can be nested.</Text>
        </RowLabel>
        <CollectionsSuggestStyled
          isLoading={isFetchingCollections}
          suggestions={collectionItems}
          getSuggestionValue={(suggestion) => `${suggestion.collectionName} ${suggestion.collectionId}`}
          getActiveSuggestOption={(suggest, activeValue) => suggest.collectionId === activeValue.collectionId}
          components={{
            SuggestItem: ({ suggestion }) => <ItemOption>
              <CollectionCover src={getIpfsUriByImagePath(suggestion.collectionCover || '')} size={24} type={'circle'} />
              <Text>{`${suggestion?.collectionName} [ID ${suggestion?.collectionId}]`}</Text>
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
          key={collection?.collectionId}
          isLoading={isFetchingTokens}
          suggestions={collection ? tokens : []}
          getSuggestionValue={(suggestion) => suggestion?.tokenId?.toString() || ''}
          getActiveSuggestOption={(suggest, activeValue) => suggest?.tokenId === activeValue?.tokenId}
          components={{
            SuggestItem: ({ suggestion }) => <ItemOption>
              <CollectionCover src={suggestion?.image?.fullUrl || ''} size={24} type={'square'} />
              <Text>{`${suggestion?.tokenPrefix || ''} #${suggestion?.tokenId}`}</Text>
            </ItemOption>
          }}
          onChange={onChangeSelectedToken}
          value={selectedToken || undefined}
          inputProps={{
            disabled: !collection
          }}
        />
      </Row>
      <Row>
        {(!isFeeLoading && isFeeGreaterThanBalance) && <LowBalanceWrapper>
          <Text size={'s'}>Your balance is insufficient due to transaction fee</Text>
        </LowBalanceWrapper>}
        <FeeMessage
          isFeeLoading={isFeeLoading}
          fee={fee || '0'}
          testid={`${testid}-fee-message`}
          placeholder={isSponsored ? `Collection ID ${token.collectionId} sponsored` : undefined}
        />
      </Row>
      <ButtonWrapper>
        <Button
          disabled={!selectedToken || isFeeGreaterThanBalance || !isAmountValid}
          onClick={onConfirmTransferToBundleClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );
};

type TransferToBundleStagesModalProps = TBundleTransferModalBodyProps & { newParent: TokenIdQuery } & {
  mode: CollectionMode
  amount: number
  owner: string
  tokenPrefix: string
}

const TransferToBundleStagesModal: FC<TransferToBundleStagesModalProps> = ({ token, owner, newParent, mode, amount, tokenPrefix, onFinish, testid }) => {
  const { info } = useNotifications();
  const { selectedAccount } = useAccounts();
  const { stages, status, initiate } = useTransferToBundleStages(owner, token, newParent, mode);

  useEffect(() => {
    if (!selectedAccount) return;
    initiate({ amount });
  }, [selectedAccount, amount]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${token?.collectionId}/${token?.tokenId}`} title={`${tokenPrefix} #${token?.tokenId}`}/> nested</div>,
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

const CollectionsSuggest = (props: SuggestProps<CollectionItem>) => <Suggest<CollectionItem> {...props} />;
const CollectionsSuggestStyled = styled(CollectionsSuggest)`
  width: 100%;
  & .unique-input-text {
    width: 100%;
  }
`;

const TokensSuggest = (props: SuggestProps<TokenItem>) => <Suggest<TokenItem> {...props} />;
const TokensSuggestStyled = styled(TokensSuggest)`
  width: 100%;
  & .unique-input-text {
    width: 100%;
  }
`;

const LowBalanceWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: calc(var(--gap) * 1.5);
  span {
    color: ${Coral700} !important;
  }
`;
