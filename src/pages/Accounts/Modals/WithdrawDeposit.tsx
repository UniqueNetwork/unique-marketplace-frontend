import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Heading, Modal, Text } from '@unique-nft/ui-kit';
import DefaultMarketStages from '../../Token/Modals/StagesModal';
import { useWithdrawDepositStages } from '../../../hooks/accountStages/useWithdrawDepositStages';
import { useApi } from '../../../hooks/useApi';
import { useNotification } from '../../../hooks/useNotification';
import { StageStatus } from '../../../types/StagesTypes';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import styled from 'styled-components/macro';
import { Avatar } from '../../../components/Avatar/Avatar';
import { getWithdrawBids } from '../../../api/restApi/auction/auction';
import { TWithdrawBid } from '../../../api/restApi/auction/types';
import { NFTToken } from '../../../api/chainApi/unique/types';
import { formatKusamaBalance } from '../../../utils/textUtils';
import { useAccounts } from '../../../hooks/useAccounts';
import { BN } from '@polkadot/util';
import Loading from '../../../components/Loading';

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
  const { api } = useApi();
  const { accounts } = useAccounts();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(true);
  const [bids, setBids] = useState<BidDeposit[]>([]);
  const [selectedBids, setSelectedBids] = useState<BidDeposit[]>([]);
  const [isSelectedSponsorshipFee, setIsSelectedSponsorshipFee] = useState<boolean>(false);

  const sponsorshipFee = useMemo(() =>
    accounts.find((item) => item.address === address)?.deposit || new BN(0), [accounts, address]);

  useEffect(() => {
    if (!address || !api || !isVisible) return;
    setBids([]);
    (async () => {
      setIsLoading(true);
      const bids = (await getWithdrawBids({ owner: address }))?.data;
      if (!bids || bids.length === 0) {
        setIsSelectedSponsorshipFee(true);
      }
      setBids(await Promise.all(bids.map(async (bid) => {
        return { ...bid, token: await api.nft?.getToken(Number(bid.collectionId), Number(bid.tokenId)) };
      })));
      setIsLoading(false);
    })();
  }, [address, api, isVisible]);

  const totalAmount = useMemo(() => {
    return sponsorshipFee.add(bids.reduce<BN>((acc, bid) =>
      acc.add(new BN(bid.amount)), new BN(0)));
  }, [sponsorshipFee, bids]);

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
    const amountToWithdraw: BN = isSelectedSponsorshipFee ? sponsorshipFee : new BN(0);
    return amountToWithdraw.add(selectedBids.reduce<BN>((acc, bid) =>
      acc.add(new BN(bid.amount)), new BN(0)));
  }, [isSelectedAll, totalAmount, isSelectedSponsorshipFee, sponsorshipFee, selectedBids]);

  useEffect(() => {
    if (!isVisible) {
      setSelectedBids([]);
      setIsSelectedAll(true);
      setIsSelectedSponsorshipFee(false);
    }
  }, [isVisible]);

  const onSubmit = useCallback(() => {
    if (amountToWithdraw.eq(new BN(0))) return;

    if (isSelectedAll) {
      onFinish(bids, sponsorshipFee);
      return;
    }
    onFinish(selectedBids, isSelectedSponsorshipFee ? sponsorshipFee : undefined);
  }, [onFinish, totalAmount, isSelectedSponsorshipFee, selectedBids, sponsorshipFee, amountToWithdraw]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>Withdraw deposit</Heading>
    </Content>
    {(bids.length > 0 || isLoading) && <Content>
      <Text size={'m'} color={'grey-500'}>All deposit</Text>
      <Checkbox checked={isSelectedAll} label={`${formatKusamaBalance(totalAmount.toString())} ${tokenSymbol}`} onChange={onSelectAll} />
    </Content>}
    {isLoading && <Content><Loading /></Content>}
    {bids.length > 0 && <Content>
      <Text size={'m'} color={'grey-500'}>Bids</Text>
      {bids.map((bid) => (<Row>
        <Checkbox checked={selectedBids.some((item) => item.auctionId === bid.auctionId)} label={''} onChange={onSelectBid(bid)}/>
        <Avatar src={bid.token?.imageUrl || ''} size={64} type={'square'} />
        <BidInfoWrapper>
          <Text size={'s'} color={'grey-500'}>{`${bid.token?.prefix} #${bid.token?.id}`}</Text>
          <Text size={'m'} >{`${formatKusamaBalance(bid.amount)} ${tokenSymbol}`}</Text>
        </BidInfoWrapper>
      </Row>))}
    </Content>}
    <Content>
      <Text size={'m'} color={'grey-500'}>Sponsorship fee</Text>
      <Checkbox checked={isSelectedSponsorshipFee} label={`${formatKusamaBalance(sponsorshipFee.toString())} ${tokenSymbol}`} onChange={onSelectSponsorshipFee} />
    </Content>
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

const BidInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
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
