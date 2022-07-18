import { Sdk } from '@unique-nft/sdk';
import '@unique-nft/sdk/state-queries';
import '@unique-nft/sdk/extrinsics';
import '@unique-nft/sdk/tokens';
import '@unique-nft/sdk/balance';
import './connectionModule';
import { Settings } from '../restApi/settings/types';

export const SDKFactory = async (settings: Settings) => {
  return await Sdk.create({ chainWsUrl: settings.blockchain.unique.wsEndpoint });
};
