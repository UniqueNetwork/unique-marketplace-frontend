/* eslint-disable react/jsx-no-bind */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link, Suggest, SuggestProps } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import DefaultMarketStages from '../Modals/StagesModal';
import { useAccounts } from 'hooks/useAccounts';
import { StageStatus } from 'types/StagesTypes';
import { TBundleTrunsferModalBodyProps } from './BundleTrunsferModal';
import { useApi } from 'hooks/useApi';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { FeeMessage } from 'components';
import { useTransferToBundleStages } from 'hooks/marketplaceStages/useTransferToBundleStages';
import { INestingToken } from 'components/BundleTree/types';
import { TokenByIdResponse, TokenIdQuery } from '@unique-nft/sdk';
import { debounce } from 'utils/helpers';
import { fromStringToBnString } from 'utils/bigNum';
import { Coral700 } from 'styles/colors';
import { useGetCollectionsForNesting } from '../hooks/useGetCollectionsForNesting';
import { CollectionItem, TokenItem } from '../types';
import { getIpfsUriByImagePath } from 'utils/urlUtils';
import { useGetAllOwnedTokensByCollection } from '../hooks/useGetAllOwnedTokensByCollection';

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

const AskTransferToBundleModal: FC<{ token: INestingToken | TokenByIdResponse, onTransferToBundle(newParent: TokenIdQuery): void, testid: string }> = ({ token, onTransferToBundle, testid }) => {
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [fee, setFee] = useState<string>('0');

  const { selectedAccount } = useAccounts();
  const { api } = useApi();

  const { collections: collectionItems, fetchCollections, isFetching: isFetchingCollections } = useGetCollectionsForNesting();
  const { tokens, isFetchingTokens } = useGetAllOwnedTokensByCollection(collection?.collectionId, useMemo(() => ({
    excludeTokenId: {
      collectionId: token.collectionId,
      tokenId: token.tokenId
    }
  }), [token]));

  useEffect(() => {
    if (!selectedAccount) return;
    void (async () => {
      await fetchCollections(selectedAccount);
    })();
  }, [selectedAccount, api?.nft]);

  const getFee = useCallback((newParentToken: TokenItem) => {
    setIsFeeLoading(true);
    return debounce(() => {
      if (!api?.market || !token || !selectedAccount || !newParentToken) return setIsFeeLoading(false);

      api?.nft?.getTransferToBundleFee(
        { collectionId: token.collectionId, tokenId: token.tokenId },
        { collectionId: newParentToken.collectionId, tokenId: newParentToken.tokenId },
        1,
        { account: selectedAccount })
      .then((fee) => {
        setFee(fee || '0');
      }).catch((e) => {
        console.error('Failed to get fee: ', e);
      }).finally(() => {
        setIsFeeLoading(false);
      });
    }, 300)();
  }, [api?.market, token, selectedAccount?.account]);

  const onConfirmTransferToBundleClick = useCallback(
    () => {
      if (!selectedToken) return;
      onTransferToBundle({ collectionId: selectedToken?.collectionId, tokenId: selectedToken?.tokenId });
    },
    [onTransferToBundle, selectedToken]
  );

  const onChangeSelectedCollection = useCallback((collection: CollectionItem | null) => {
    setCollection(collection);
    setSelectedToken(null);
    setFee('0');
  }, []);

  const onChangeSelectedToken = useCallback((token: TokenItem) => {
    setSelectedToken(token);
    getFee(token);
  }, []);

  const isFeeGreaterThanBalance = useMemo(() => {
    if (!fee) return false;
    const feeBN = new BN(fromStringToBnString(fee));
    return feeBN.gt(selectedAccount?.balance?.raw || new BN(0));
  }, [fee, selectedAccount?.balance?.raw]);

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
        />
      </Row>
      <ButtonWrapper>
        <Button
          disabled={!selectedToken || isFeeGreaterThanBalance}
          onClick={onConfirmTransferToBundleClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </>
  );
};

const TransferToBundleStagesModal: FC<TBundleTrunsferModalBodyProps & { newParent: TokenIdQuery }> = ({ token, newParent, onFinish, testid }) => {
  const { stages, status, initiate } = useTransferToBundleStages(token.owner, token, newParent);
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
