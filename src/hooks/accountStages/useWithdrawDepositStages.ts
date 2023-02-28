import { useApi } from '../useApi';
import { useCallback, useMemo } from 'react';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TWithdrawBid } from 'api/restApi/auction/types';
import { BN, stringToHex } from '@polkadot/util';
import { withdrawChooseBids } from 'api/restApi/auction/auction';
import { formatKusamaBalance } from '../../utils/textUtils';

const tokenSymbol = 'KSM';

export type TWithdrawDeposit = {
  address: string
};

export const useWithdrawDepositStages = (accountAddress: string, bids: TWithdrawBid[], withdrawSponsorshipFee?: BN) => {
  const { api, baseURL } = useApi();
  const { accounts } = useAccounts();
  const marketApi = api?.market;

  const bidsAmount = useMemo(() => bids.reduce<BN>((acc, bid) =>
    acc.add(new BN(bid.amount)), new BN(0)), [bids]);

  const withdrawSponsorshipFeeStage: InternalStage<TWithdrawDeposit>[] = useMemo(() => withdrawSponsorshipFee && !withdrawSponsorshipFee.isZero()
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
      action: async ({ options }) => {
        if (!options.signer) throw new Error('Account not selected');

        const timestamp = Date.now();
        const auctionIds = bids.map((bid) => `auctionId=${bid.auctionId}`).join('&');
        const message = `${auctionIds}&timestamp=${timestamp}`;
        const { signature } = await options.signer.sign({ signerPayloadHex: stringToHex(message) });
        await withdrawChooseBids(baseURL,
          { auctionIds: `${auctionIds}`, timestamp },
          { signature, signer: options.signer.getAddress() }
        );
      }
    }]
    : [], [baseURL, bids, bidsAmount]);

  const withdrawDepositStages: InternalStage<TWithdrawDeposit>[] = useMemo(() => [
    ...withdrawSponsorshipFeeStage,
    ...withdrawBidsStage
  ], [withdrawSponsorshipFeeStage, withdrawBidsStage]);

  const signer = useMemo(() => {
    return accounts.find(({ address }) => address === accountAddress);
  }, [accounts, accountAddress]);

  const { stages, error, status, initiate: initiateStages } = useStages<TWithdrawDeposit>(withdrawDepositStages, signer);

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
