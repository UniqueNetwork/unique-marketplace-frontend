import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TFixPriceProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { addToWhitelist } from 'api/restApi/settings/settings';

export const useSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signTx, selectedAccount, signMessage } = useAccounts();
  const marketApi = api?.market;
  const addToWhiteListStage: InternalStage<TFixPriceProps> = useMemo(() => ({
    title: 'Register sponsorship',
    description: '',
    status: StageStatus.default,
    action: (params) =>
      marketApi?.addToWhiteList(
        params.txParams.accountAddress,
        {
          ...params.options,
          send:
            async (signature) => {
              try {
                await addToWhitelist({ account: params.txParams.accountAddress }, signature as string);
              } catch (e) {
                console.error('Adding to whitelist failed');
              }
            }
        },
        signMessage
      )
  }), [marketApi, signMessage]);

  const sellFixStages: InternalStage<TFixPriceProps>[] = useMemo(() => [
  ...(!selectedAccount?.isOnWhiteList ? [addToWhiteListStage] : []),
  {
    title: 'Prepare NFT to be sent to smart contract',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.lockNftForSale(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
  },
  {
    title: 'Allow smart contract to receive an NFT',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.sendNftToSmartContract(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params.options)
  },
  {
    title: 'Set the NFT price',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.setForFixPriceSale(params.txParams.accountAddress, collectionId.toString(), tokenId.toString(), params?.txParams?.price.toString() || '-1', params.options)
  }], [selectedAccount?.isOnWhiteList, addToWhiteListStage, marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TFixPriceProps>(sellFixStages, signTx);

  return {
    stages,
    error,
    status,
    initiate
  };
};
