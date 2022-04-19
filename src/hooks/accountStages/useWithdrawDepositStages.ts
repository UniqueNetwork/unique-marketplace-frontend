import { useApi } from '../useApi';
import { useCallback, useMemo } from 'react';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { TTransaction } from '../../api/chainApi/types';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TWithdrawBid } from '../../api/restApi/auction/types';
import { BN } from '@polkadot/util';
import { withdrawChooseBids } from '../../api/restApi/auction/auction';
import { formatKusamaBalance } from '../../utils/textUtils';

const tokenSymbol = 'KSM';

export type TWithdrawDeposit = {
  address: string
};

export const useWithdrawDepositStages = (accountAddress: string, bids: TWithdrawBid[], withdrawSponsorshipFee?: BN) => {
  const { api } = useApi();
  const { signTx, accounts, signMessage } = useAccounts();
  const marketApi = api?.market;

  const account = useMemo(() => accounts.find((account) => account.address === accountAddress), [accountAddress]);

  const bidsAmount = useMemo(() => bids.reduce<BN>((acc, bid) =>
    acc.add(new BN(bid.amount)), new BN(0)), [bids]);

  const withdrawSponsorshipFeeStage: InternalStage<TWithdrawDeposit>[] = useMemo(() => withdrawSponsorshipFee
    ? [{
      title: `Withdraw sponsorship fee: ${formatKusamaBalance(withdrawSponsorshipFee?.toString())} ${tokenSymbol}`,
      description: '',
      status: StageStatus.default,
      action: (params) => marketApi?.withdrawDeposit(params.txParams.address, params.options)
    }]
    : [], [marketApi, withdrawSponsorshipFee]);

  const withdrawBidsStage: InternalStage<TWithdrawDeposit>[] = useMemo(() => bids.length > 0
    ? [{
      title: `Withdraw bids: ${formatKusamaBalance(bidsAmount.toString())} ${tokenSymbol}`,
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!account) throw new Error('Account not selected');

        const timestamp = Date.now();
        const auctionIds = bids.map((bid) => `auctionId=${bid.auctionId}`).join('&');
        const message = `${auctionIds}&timestamp=${timestamp}`;
        const signature = await signMessage(message, account);
        await withdrawChooseBids(
          { auctionIds: `${auctionIds}`, timestamp },
          { signature, signer: account.address }
        );
      }
    }]
    : [], [bids, account, bidsAmount]);

  const withdrawDepositStages: InternalStage<TWithdrawDeposit>[] = useMemo(() => [
    ...withdrawSponsorshipFeeStage,
    ...withdrawBidsStage
  ], [withdrawSponsorshipFeeStage, withdrawBidsStage]);

  const sign = useCallback(async (tx: TTransaction) => {
    return await signTx(tx, accountAddress);
  }, [signTx, accountAddress]);

  const { stages, error, status, initiate: initiateStages } = useStages<TWithdrawDeposit>(withdrawDepositStages, sign);

  const initiate = useCallback(() => {
    initiateStages({ address: accountAddress });
  }, [initiateStages, accountAddress]);

  return {
    stages,
    error,
    status,
    initiate
  };
};
