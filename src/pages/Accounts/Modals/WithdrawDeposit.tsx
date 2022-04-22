import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Heading, Modal, Text } from '@unique-nft/ui-kit';
import { BN } from '@polkadot/util';
import styled from 'styled-components/macro';

import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { useWithdrawDepositStages } from '../../../hooks/accountStages/useWithdrawDepositStages';
import { useApi } from '../../../hooks/useApi';
import { useNotification } from '../../../hooks/useNotification';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { Avatar } from '../../../components/Avatar/Avatar';
import { getWithdrawBids } from '../../../api/restApi/auction/auction';
import { TWithdrawBid } from '../../../api/restApi/auction/types';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { useAccounts } from '../../../hooks/useAccounts';
import Loading from '../../../components/Loading';
import InlineTokenCard from '../../../components/TokensCard/InlineTokenCard';

const tokenSymbol = 'KSM';

export type WithdrawDepositModalProps = {
  isVisible: boolean
  address?: string
  onFinish(): void
  onClose(): void
}

type BidDeposit = TWithdrawBid & {
  token?: NFTToken
};

export const WithdrawDepositModal: FC<WithdrawDepositModalProps> = ({ isVisible, address, onFinish, onClose }) => {
  const [status, setStatus] = useState<'ask' | 'stage'>('ask');
  const [withdrawSponsorshipFee, setWithdrawSponsorshipFee] = useState<BN>();
  const [withdrawBids, setWithdrawBids] = useState<BidDeposit[]>([]);

  const onWithdraw = useCallback((withdrawBids: BidDeposit[], withdrawSponsorshipFee?: BN) => {
    setWithdrawSponsorshipFee(withdrawSponsorshipFee);
    setWithdrawBids(withdrawBids);
    setStatus('stage');
  }, [setStatus]);

  const onFinishStages = useCallback(() => {
    setStatus('ask');
    onFinish();
  }, [onFinish]);

  if (status === 'ask') {
    return (<WithdrawDepositAskModal
      address={address}
      isVisible={isVisible}
      onFinish={onWithdraw}
      onClose={onClose}
    />);
  }
  if (status === 'stage') {
    return (<WithdrawDepositStagesModal
      isVisible={isVisible}
      address={address}
      bids={withdrawBids}
      withdrawSponsorshipFee={withdrawSponsorshipFee}
      onFinish={onFinishStages}
      onClose={onClose}
    />);
  }
  return null;
};

export type WithdrawDepositAskModalProps = {
  isVisible: boolean
  address?: string
  onFinish(withdrawBids: BidDeposit[], amountToWithdraw?: BN): void
  onClose(): void
}

export const WithdrawDepositAskModal: FC<WithdrawDepositAskModalProps> = ({ isVisible, address, onClose, onFinish }) => {
  const { accounts } = useAccounts();
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(true);
  const [selectedBids, setSelectedBids] = useState<BidDeposit[]>([]);
  const [isSelectedSponsorshipFee, setIsSelectedSponsorshipFee] = useState<boolean>(false);

  const account = useMemo(() =>
    accounts.find((item) => item.address === address), [accounts, address]);

  const { bids, sponsorshipFee } = account?.deposits || { sponsorshipFee: new BN(0) };
  const { withdraw, leader } = bids || { withdraw: [], leader: [] };

  const totalAmount = useMemo(() => {
    return (account?.deposits?.sponsorshipFee || new BN(0)).add(withdraw.reduce<BN>((acc, bid) =>
      acc.add(new BN(bid.amount)), new BN(0)));
  }, [account]);

  const onSelectAll = useCallback((value: boolean) => {
    setIsSelectedAll(value);
    if (value) {
      setSelectedBids([]);
      setIsSelectedSponsorshipFee(false);
    }
  }, [totalAmount]);

  const onSelectSponsorshipFee = useCallback((value: boolean) => {
    setIsSelectedAll(false);
    setIsSelectedSponsorshipFee(value);
  }, []);

  const onSelectBid = useCallback((bid: BidDeposit) => (value: boolean) => {
    if (value) {
      setIsSelectedAll(false);
      setSelectedBids([...selectedBids, bid]);
    } else {
      setSelectedBids(selectedBids.filter((item) => item.auctionId !== bid.auctionId));
    }
  }, [selectedBids]);

  const amountToWithdraw = useMemo(() => {
    if (isSelectedAll) return totalAmount;
    const amountToWithdraw: BN = isSelectedSponsorshipFee && sponsorshipFee ? sponsorshipFee : new BN(0);
    return amountToWithdraw.add(selectedBids.reduce<BN>((acc, bid) =>
      acc.add(new BN(bid.amount)), new BN(0)));
  }, [isSelectedAll, totalAmount, isSelectedSponsorshipFee, sponsorshipFee, selectedBids]);

  useEffect(() => {
    if (isVisible) {
      setSelectedBids([]);
      setIsSelectedAll(withdraw.length > 0); // if there are some bids to withdraw
      setIsSelectedSponsorshipFee(withdraw.length === 0); // else
    }
  }, [isVisible, account?.deposits?.bids]);

  const onSubmit = useCallback(() => {
    if (amountToWithdraw.eq(new BN(0))) return;

    if (isSelectedAll) {
      onFinish(withdraw, sponsorshipFee);
      return;
    }
    onFinish(selectedBids, isSelectedSponsorshipFee ? sponsorshipFee : undefined);
  }, [onFinish, totalAmount, isSelectedSponsorshipFee, selectedBids, sponsorshipFee, amountToWithdraw]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>Withdraw deposit</Heading>
    </Content>
    {(withdraw.length > 0) && <Content>
      <Text size={'m'} color={'grey-500'}>All deposit</Text>
      <Checkbox checked={isSelectedAll} label={`${formatKusamaBalance(totalAmount.toString())} ${tokenSymbol}`} onChange={onSelectAll} />
    </Content>}
    {(leader.length > 0 || withdraw.length > 0) && <Content>
      <Text size={'m'} color={'grey-500'}>Bids</Text>
      {[...leader, ...withdraw].map((bid, index) => (<Row>
        <Checkbox
          disabled={index < leader.length}
          label={''}
          checked={selectedBids.some((item) => item.auctionId === bid.auctionId)}
          onChange={onSelectBid(bid)}
        />
        <InlineTokenCard
          tokenId={Number(bid.tokenId)}
          collectionId={Number(bid.collectionId)}
        >
          <Text size={'m'} >{`${formatKusamaBalance(bid.amount)} ${tokenSymbol}`}</Text>
          {index < leader.length && <Text size={'s'} color={'additional-positive-500'}>Leading bid</Text>}
        </InlineTokenCard>
      </Row>))}
    </Content>}
    {sponsorshipFee && !sponsorshipFee?.isZero() && <Content>
      <Text size={'m'} color={'grey-500'}>Sponsorship fee</Text>
      <Checkbox checked={isSelectedSponsorshipFee} label={`${formatKusamaBalance(sponsorshipFee?.toString() || '0')} ${tokenSymbol}`} onChange={onSelectSponsorshipFee} />
    </Content>}
    <Row>
      <Text color='grey-500'>Amount to withdraw:&nbsp;</Text>
      <Text>{`${formatKusamaBalance(amountToWithdraw.toString())} ${tokenSymbol}`}</Text>
    </Row>
    <ButtonWrapper>
      <Button
        disabled={amountToWithdraw.eq(new BN(0))}
        onClick={onSubmit}
        role='primary'
        title='Confirm'
      />
    </ButtonWrapper>
  </Modal>);
};

const Content = styled.div`
  && {
    border-bottom: 1px dashed #D2D3D6;
    padding-bottom: calc(var(--gap) * 1.5);
    margin-bottom: calc(var(--gap) * 1.5);
    display: flex;
    flex-direction: column;
    row-gap: var(--gap);
    h2 {
      margin-bottom: 0px;
    }
  }
`;

const Row = styled.div`
  display: flex;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--gap);
`;

export type WithdrawDepositStagesModalProps = {
  isVisible: boolean
  address?: string
  bids: BidDeposit[]
  withdrawSponsorshipFee?: BN
  onFinish(): void
  onClose(): void
}

export const WithdrawDepositStagesModal: FC<WithdrawDepositStagesModalProps> = ({ bids, withdrawSponsorshipFee, isVisible, address, onFinish }) => {
  const { stages, status, initiate } = useWithdrawDepositStages(address || '', bids, withdrawSponsorshipFee);
  const { api } = useApi();
  const { push } = useNotification();

  useEffect(() => {
    if (!isVisible) return;
    initiate();
  }, [isVisible]);

  useEffect(() => {
    if (status === StageStatus.success) {
      push({ severity: NotificationSeverity.success, message: 'Deposit withdrawn' });
    }
  }, [status]);

  if (!isVisible || !api?.market) return null;

  return (<Modal isVisible={isVisible} isClosable={false}>
    <div>
      <DefaultMarketStages stages={stages} status={status} onFinish={onFinish} />
    </div>
  </Modal>);
};
