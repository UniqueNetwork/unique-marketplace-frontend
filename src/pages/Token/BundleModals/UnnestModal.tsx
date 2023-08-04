import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Heading, Link, Skeleton } from '@unique-nft/ui-kit';
import { Text, useNotifications, Button } from 'components/UI';
import { BN } from '@polkadot/util';
import styled from 'styled-components';

import DefaultMarketStages from '../Modals/StagesModal';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { useUnnestStages } from '../../../hooks/marketplaceStages/useUnnestStages';
import { TBundleTrunsferModalBodyProps } from './BundleTrunsferModal';
import { FeeMessage } from 'components';
import { INestingToken } from 'components/BundleTree/types';
import { useApi } from 'hooks/useApi';
import { fromStringToBnString } from 'utils/bigNum';
import { Coral700 } from 'styles/colors';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse, TokenIdQuery } from '@unique-nft/sdk';
import { FractionalAmountInput } from '../Modals/FractionalAmountInput';
import { CollectionMode } from 'api/chainApi/types';
import { Address } from '@unique-nft/utils';

export const UnnestModal: FC<TBundleTrunsferModalBodyProps> = ({ token, setIsClosable, onFinish, testid }) => {
  const { selectedAccount } = useAccounts();
  const { api } = useApi();
  const [status, setStatus] = useState<'ask' | 'unnest-stage'>('ask'); // TODO: naming
  const [isFetching, setIsFetching] = useState(false);
  const [collection, setCollection] = useState<CollectionInfoWithSchemaResponse | null>(null);
  const [amount, setAmount] = useState(1);
  const [parentAddress, setParentAddress] = useState<string>('');

  useEffect(() => {
    void (async () => {
      if (!api?.collection) return;
      setIsFetching(true);
      const collection = await api.collection.getCollection(token?.collectionId);
      setCollection(collection);
      setIsFetching(false);
      if (collection?.mode === 'ReFungible' && token.nestingParentToken) {
        setParentAddress(Address.nesting.idsToAddress(
          token.nestingParentToken.collectionId,
          token.nestingParentToken.tokenId
        ));
      }
    })();
  }, [api?.collection, token?.collectionId]);

  const onUnnest = useCallback((amount: number) => {
    setAmount(amount);
    setStatus('unnest-stage');
    setIsClosable(false);
  }, [setStatus, setIsClosable]);

  if (!selectedAccount || !token) return null;

  if (isFetching) return <Skeleton />;

  if (status === 'ask') {
    return (<AskUnnestModal
      token={token}
      parentAddress={token.owner || parentAddress}
      collection={collection}
      onUnnest={onUnnest}
      testid={`${testid}-ask-transfer`}
    />);
  }
  if (status === 'unnest-stage') {
    return (<UnnestStagesModal
      tokenPrefix={collection?.tokenPrefix || ''}
      onFinish={onFinish}
      parentAddress={token.owner || parentAddress}
      mode={collection?.mode || 'NFT'}
      amount={amount}
      tokenId={token.tokenId}
      collectionId={token.collectionId}
      setIsClosable={setIsClosable}
      testid={testid}
    />);
  }
  return null;
};

type AskUnnestModalProps = { token: INestingToken | TokenByIdResponse, parentAddress: string, collection: CollectionInfoWithSchemaResponse | null, onUnnest(amount: number): void, testid: string };

const AskUnnestModal: FC<AskUnnestModalProps> = ({ token, parentAddress, collection, onUnnest, testid }) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [fee, setFee] = useState<string>('0');
  const [isSponsored, setIsSponsored] = useState(false);
  const [amount, setAmount] = useState(1);
  const [isAmountValid, setIsAmountValid] = useState(true);

  useEffect(() => {
    if (!api?.nft || !token?.tokenId || !selectedAccount || !collection) return;
    setIsFeeLoading(true);
    const isSponsored = !!collection?.sponsorship?.isConfirmed;
    setIsSponsored(isSponsored);

    if (isSponsored) return setIsFeeLoading(false);
    api.nft?.getUnnestFee(
      token.collectionId,
      token.tokenId,
      parentAddress,
      collection?.mode || 'NFT',
      amount,
      { account: selectedAccount }
    ).then((fee) => {
      setFee(fee || '0');
    }).catch((e) => {
      console.error('Failed to get fee: ', e);
    }).finally(() => {
      setIsFeeLoading(false);
    });
  }, [token.tokenId, amount, collection, token.collectionId, api?.nft, selectedAccount?.address, selectedAccount, parentAddress]);

  const onConfirmUnnestClick = useCallback(
    () => {
      onUnnest(amount);
    },
    [onUnnest, amount]
  );

  const isFeeGreaterThanBalance = useMemo(() => {
    if (!fee || isSponsored) return false;
    const feeBN = new BN(fromStringToBnString(fee));
    return feeBN.gt(selectedAccount?.balance?.raw || new BN(0));
  }, [fee, selectedAccount?.balance?.raw, isSponsored]);

  return (
    <>
      <Content>
        <Heading size='2'>Unnest token</Heading>
      </Content>
      {collection?.mode !== 'ReFungible' && <Row>
        <Text size={'m'}>{'This will disconnect your token from the parent NFT. All other nesting connections will remain intact.'}</Text>
      </Row>}
      {collection?.mode === 'ReFungible' && <FractionalAmountInput
        collectionId={token.collectionId}
        tokenId={token.tokenId}
        ownerAddress={parentAddress}
        amount={amount}
        onChangeAmount={setAmount}
        onChangeIsAmountValid={setIsAmountValid}
      />}
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
          onClick={onConfirmUnnestClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
          disabled={!isAmountValid}
        />
      </ButtonWrapper>
    </>
  );
};

type UnnestStagesModalProps = Omit<TBundleTrunsferModalBodyProps, 'token'> & TokenIdQuery & {
  amount: number
  parentAddress: string
  mode: CollectionMode
  tokenPrefix: string
};

const UnnestStagesModal: FC<UnnestStagesModalProps> = ({ tokenId, collectionId, parentAddress, mode, amount, tokenPrefix, onFinish, testid }) => {
  const { stages, status, initiate } = useUnnestStages({ tokenId, collectionId }, parentAddress, mode);
  const { info } = useNotifications();
  const { selectedAccount } = useAccounts();

  useEffect(() => {
    if (!selectedAccount?.address) return;
    void initiate({ amount });
  }, [selectedAccount?.address]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> unnested</div>,
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

const Row = styled.div`
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
`;

const LowBalanceWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  span {
    color: ${Coral700} !important;
  }
`;
