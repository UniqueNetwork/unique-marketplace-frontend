import { useApi } from '../useApi';
import { useCallback, useMemo } from 'react';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { TWithdrawBid } from 'api/restApi/auction/types';
import { BN } from '@polkadot/util';
import { formatBalance } from '../../utils/textUtils';

export type TWithdrawDeposit = {
  address: string
};

export const useWithdrawDepositStages = (accountAddress: string, bids: TWithdrawBid[]) => {
  const { baseURL, chainProperties } = useApi();
  const { accounts } = useAccounts();

  const bidsAmount = useMemo(() => bids.reduce<BN>((acc, bid) =>
    acc.add(new BN(bid.amount)), new BN(0)), [bids]);

  const withdrawBidsStage: InternalStage<TWithdrawDeposit>[] = useMemo(() => bids.length > 0
    ? [{
      title: `Withdraw bids: ${formatBalance(bidsAmount.toString())} ${chainProperties?.token}`,
      description: '',
      status: StageStatus.default,
      action: async ({ options }) => {
        if (!options.account) throw new Error('Account not selected');

        const timestamp = Date.now();
        const auctionIds = bids.map((bid) => `auctionId=${bid.auctionId}`).join('&');
        const message = `${auctionIds}&timestamp=${timestamp}`;
        await Promise.resolve();
        // const { signature } = await options.account.sign({ signerPayloadHex: stringToHex(message) });
        // await withdrawChooseBids(baseURL,
        //   { auctionIds: `${auctionIds}`, timestamp },
        //   { signature, signer: options.account.address }
        // );
      }
    }]
    : [], [baseURL, bids, bidsAmount]);

  const withdrawDepositStages: InternalStage<TWithdrawDeposit>[] = useMemo(() => [
    ...withdrawBidsStage
  ], [withdrawBidsStage]);

  const account = useMemo(() => {
    return accounts.get(accountAddress);
  }, [accounts, accountAddress]);

  const { stages, error, status, initiate: initiateStages } = useStages<TWithdrawDeposit>(withdrawDepositStages, account);

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
