import { Sdk, addFeature } from '@unique-nft/sdk';
import '@unique-nft/sdk/extrinsics';
import Web3 from 'web3';
import { EvmCollectionAbiMethods, MarketplaceAbiMethods } from '../chainApi/unique/types';
import marketplaceAbi from '../chainApi/unique/abi/marketPlaceAbi.json';
import nonFungibleAbi from '../chainApi/unique/abi/nonFungibleAbi.json';
import { collectionIdToAddress } from '../chainApi/utils/addressUtils';

class marketSdkModule {
  private sdk: Sdk;
  constructor(sdk: Sdk) {
    this.sdk = sdk;
  }
}

declare module '@unique-nft/sdk' {
  export interface Sdk {
    market: marketSdkModule;
  }
}

addFeature('market', marketSdkModule);
