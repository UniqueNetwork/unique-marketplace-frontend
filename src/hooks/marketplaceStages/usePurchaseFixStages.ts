import { useMemo } from 'react';
import { MetamaskAccount } from '@unique-nft/accounts/metamask';
import { Address } from '@unique-nft/utils';

import { useApi } from '../useApi';
import { TPurchaseProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';

export const usePurchaseFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  // move money to mirror for payment on substrate wallet
  const purchaseStages: InternalStage<TPurchaseProps>[] = useMemo(() => {
    const account = selectedAccount?.account;
    if (!account) return [];
    const mirrorAddress = Address.mirror.substrateToEthereum(account.address);
    return [
    // for polkadot accounts transfer money to mirror
    ...(selectedAccount?.account.constructor === MetamaskAccount
? []
: [
    {
      title: 'Transfer to mirror',
      description: '',
      status: StageStatus.default,
      action: async ({ options, txParams }) => {
        const mirrorBalance = await marketApi?.getAccountBalance(mirrorAddress);
        const fee = Number(await marketApi?.getBuyFixFee(collectionId, tokenId, txParams.amount, options));
        const toTransfer = Number(txParams.price) + fee - Number(mirrorBalance?.parsed);
        if (toTransfer <= 0) return;
        //                                           just to be safe and makeup for potential rounding issues
        return marketApi?.transferBalance(account.address, mirrorAddress, toTransfer + 1, options);
      }
}]) as InternalStage<TPurchaseProps>[],
    {
      title: 'Purchasing token',
      description: '',
      status: StageStatus.default,
      action: ({ options, txParams }) => marketApi?.buyFix(collectionId, tokenId, txParams.amount, options)
    }
  ];
}, [marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TPurchaseProps>(purchaseStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
