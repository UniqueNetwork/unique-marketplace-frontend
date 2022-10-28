import { useMemo } from 'react';

import { addToWhitelist } from 'api/restApi/settings/settings';
import { useApi } from '../useApi';
import { TFixPriceProps } from 'pages/Token/Modals/types';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { stringToHex } from '@polkadot/util';

export const useSellFixStages = (collectionId: number, tokenId: number) => {
  const { api, baseURL } = useApi();
  const { selectedAccount } = useAccounts();
  const marketApi = api?.market;
  const addToWhiteListStage: InternalStage<TFixPriceProps> = useMemo(() => ({
    title: 'Register sponsorship',
    description: '',
    status: StageStatus.default,
    action: ({ txParams, options }) =>
      marketApi?.addToWhiteList(
        txParams.accountAddress,
        {
          ...options,
          send:
            async ({ signature }) => {
              try {
                await addToWhitelist(baseURL, { account: txParams.accountAddress }, signature as string);
              } catch (e) {
                console.error('Adding to whitelist failed');
              }
            }
        },
        async (message) => {
          if (!options.signer) throw new Error('Account not selected');
          const { signature } = await options.signer.sign({ signerPayloadHex: stringToHex(message) });
          return signature;
        }
      )
  }), [marketApi]);

  const sellFixStages: InternalStage<TFixPriceProps>[] = useMemo(() => [
  ...(!selectedAccount?.isOnWhiteList ? [addToWhiteListStage] : []),
  {
    title: 'Prepare NFT to be sent to smart contract',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.lockNftForSale(
      params.txParams.accountAddress,
      collectionId.toString(),
      tokenId.toString(),
      params.options
    )
  },
  {
    title: 'Allow smart contract to receive an NFT',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.sendNftToSmartContract(
      params.txParams.accountAddress,
      collectionId.toString(),
      tokenId.toString(),
      params.options
    )
  },
  {
    title: 'Set the NFT price',
    description: '',
    status: StageStatus.default,
    action: (params) => marketApi?.setForFixPriceSale(
      params.txParams.accountAddress,
      collectionId.toString(),
      tokenId.toString(),
      params?.txParams?.price.toString() || '-1',
      params.options
    )
  }], [selectedAccount?.isOnWhiteList, addToWhiteListStage, marketApi, collectionId, tokenId]);
  const { stages, error, status, initiate } = useStages<TFixPriceProps>(sellFixStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
