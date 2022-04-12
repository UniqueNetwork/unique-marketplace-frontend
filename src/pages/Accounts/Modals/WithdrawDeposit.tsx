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
import { Bid } from '../../../api/restApi/offers/types';

const tokenSymbol = 'KSM';

export type WithdrawDepositModalProps = {
  isVisible: boolean
  address?: string
  onFinish(): void
  onClose(): void
}

type BidDeposit = Bid & {
  id: number
  isLeading?: boolean
  token?: {
    id: number
    prefix: string
    image: string
  }
};

export const WithdrawDepositModal: FC<WithdrawDepositModalProps> = ({ isVisible, address, onFinish, onClose }) => {
  const [status, setStatus] = useState<'ask' | 'stage'>('ask');

  const onWithdraw = useCallback(() => {
    setStatus('stage');
  }, [setStatus]);

  const onFinishStages = useCallback(() => {
    setStatus('ask');
    onFinish();
  }, [onFinish]);

  if (status === 'ask') {
    return (<WithdrawDepositAskModal
      isVisible={isVisible}
      onFinish={onWithdraw}
      onClose={onClose}
    />);
  }
  if (status === 'stage') {
    return (<WithdrawDepositStagesModal
      isVisible={isVisible}
      address={address}
      onFinish={onFinishStages}
      onClose={onClose}
    />);
  }
  return null;
};

export const WithdrawDepositAskModal: FC<WithdrawDepositModalProps> = ({ isVisible, address, onClose, onFinish }) => {
  const [amountToWithdraw, setAmountToWithdraw] = useState(0);
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(true);
  const [selectedBids, setSelectedBids] = useState<BidDeposit[]>([]);
  const [isSelectedSponsorshipFee, setIsSelectedSponsorshipFee] = useState<boolean>(false);

  const totalAmount = useMemo(() => {
    return 0; // TODO: calc total amount of all deposits
  }, []);

  const bids: BidDeposit[] = useMemo(() => {
    return []; // TODO: get deposits of bids and
  }, []);

  const sponsorshipFee = useMemo(() => {
    return 0;
  }, []);

  const calculateAmountToWithdraw = useCallback(() => {
    const amountToWithdraw: number = isSelectedSponsorshipFee ? sponsorshipFee : 0;
    setAmountToWithdraw(amountToWithdraw + selectedBids.reduce<number>((acc, bid) =>
      acc + Number(bid.amount), 0));
  }, [isSelectedSponsorshipFee, sponsorshipFee, selectedBids]);

  const onSelectAll = useCallback((value: boolean) => {
    setIsSelectedAll(value);
    if (!value) {
      setAmountToWithdraw(0);
    } else {
      setSelectedBids([]);
      setIsSelectedSponsorshipFee(false);
      setAmountToWithdraw(totalAmount);
    }
  }, [totalAmount]);

  const onSelectSponsorshipFee = useCallback((value: boolean) => {
    setIsSelectedAll(false);
    setIsSelectedSponsorshipFee(value);
    calculateAmountToWithdraw();
  }, [calculateAmountToWithdraw]);

  const onSelectBid = useCallback((bid: BidDeposit) => (value: boolean) => {
    if (value) {
      setSelectedBids([...selectedBids, bid]);
    } else {
      setSelectedBids(selectedBids.filter((item) => item.id !== bid.id));
    }
    calculateAmountToWithdraw();
  }, [selectedBids]);

  const onSubmit = useCallback(() => {
    onFinish();
  }, [onFinish]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>Transfer NFT token</Heading>
    </Content>
    <Content>
      <Text size={'m'} color={'grey-500'}>All deposit</Text>
      <Checkbox checked={isSelectedAll} label={`${totalAmount} ${tokenSymbol}`} onChange={onSelectAll} />
    </Content>
    {bids.length > 0 && <Content>
      <Text size={'m'} color={'grey-500'}>Bids</Text>
      {bids.map((bid) => (<Row>
        <Checkbox checked={true} label={''} onChange={onSelectBid(bid)}/>
        <Avatar src={''} size={64} type={'square'} />
        <BidInfoWrapper>
          <Text size={'s'} color={'grey-500'}>{`${bid.token?.prefix} #${bid.token?.id}`}</Text>
          <Text size={'m'} >{`${bid.amount} ${tokenSymbol}`}</Text>
          <Text size={'m'} >{`${bid.amount} ${tokenSymbol}`}</Text>
        </BidInfoWrapper>
      </Row>))}
    </Content>}
    <Content>
      <Text size={'m'} color={'grey-500'}>Sponsorship fee</Text>
      <Checkbox checked={isSelectedSponsorshipFee} label={`${sponsorshipFee} ${tokenSymbol}`} onChange={onSelectSponsorshipFee} />
    </Content>
    <Row>
      <Text color='grey-500'>Amount to withdraw:</Text>
      <Text>{`${amountToWithdraw} ${tokenSymbol}`}</Text>
    </Row>
    <ButtonWrapper>
      <Button
        // disabled={!validPassword || !password || !name}
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

export const WithdrawDepositStagesModal: FC<WithdrawDepositModalProps> = ({ isVisible, address, onFinish }) => {
  const { stages, status, initiate } = useWithdrawDepositStages(address || '');
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
