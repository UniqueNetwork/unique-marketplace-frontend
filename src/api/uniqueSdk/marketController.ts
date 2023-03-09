import { Client, TokenByIdResponse } from '@unique-nft/sdk';
import { TokenIdArguments } from '@unique-nft/substrate-client/tokens';
import { isEthereumAddress } from '@unique-nft/substrate-client/utils';
import { BN } from '@polkadot/util';
import { EvmCollectionAbiMethods, MarketplaceAbiMethods, TokenAskType, TransactionOptions, TSignMessage, UniqueController } from './types';
import marketplaceAbi from './contracts/marketplace-0.json';
import { collectionIdToAddress, getEthAccount, compareEncodedAddresses, isTokenOwner } from './utils/addressUtils';
import { formatKsm, fromStringToBnString } from './utils/textFormat';
import { repeatCheckForTransactionFinish } from './utils/repeatCheckTransaction';
import { Address } from '@unique-nft/substrate-client/types';
import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { AllBalances, Balance } from '@unique-nft/substrate-client/balance';

declare module '@unique-nft/substrate-client' {
  interface Client {
    api: ApiPromise;
    readonly balance: Balance;
  }
}

export type UniqueSDKMarketControllerOptions = {
  uniqueSdk: Client
  kusamaSdk: Client
  escrowAddress: string
  contractAddress: string
  auctionAddress: string
  wsEndpoint: string
};

export class UniqueSDKMarketController implements UniqueController {
  private uniqueSdk: Client | undefined;
  private web3Instance: Web3 | undefined;
  private minPrice = 0.000001;
  private defaultGasAmount = 2500000;
  private contractAddress = '';
  private auctionAddress = '';
  decimals = 12;

  async setNetwork(options: UniqueSDKMarketControllerOptions) {
    this.uniqueSdk = options.uniqueSdk;
    this.contractAddress = options.contractAddress;
    this.auctionAddress = options.auctionAddress;

    console.log('HELLO!?');
    // @ts-ignore
    window.test = this.uniqueSdk;
    console.log(await this.uniqueSdk.common.chainProperties());
    this.decimals = (await this.uniqueSdk.common.chainProperties()).decimals || 12;
    console.log('final decimals', this.decimals);
    const provider = new Web3.providers.WebsocketProvider(options.wsEndpoint, {
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false
      }
    });

    const web3 = new Web3(provider);
    this.web3Instance = web3;
  }

  private getMatcherContractInstance(ethAddress: string): { methods: MarketplaceAbiMethods } {
    // @ts-ignore
    return new this.web3Instance.eth.Contract(marketplaceAbi.abi, this.contractAddress, {
      from: ethAddress
    });
  }

  private getEvmCollectionInstance(collectionId: string): { methods: EvmCollectionAbiMethods, options: any } {
    // @ts-ignore
    return new this.web3Instance.eth.Contract(nonFungibleAbi, collectionIdToAddress(parseInt(collectionId, 10)), { from: this.contractOwner });
  }

  public async changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, { signer, send }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('SDK isn\'t ready');
    if (!signer) throw new Error('Signer not provided');
    const from = signer.address;
    const to = this.contractAddress;
    const isAlreadyAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (isAlreadyAllowed.isAllowed === targetAllowance) return;
    const unsignedTxPayload = await this.uniqueSdk.tokens.approve.build({ collectionId, tokenId, spender: from, address: to, isApprove: targetAllowance });
    const { signature } = await this.uniqueSdk.tokens.approve.sign(unsignedTxPayload, { signer });

    if (!signature) throw new Error('Signing failed');

    if (send) {
      const { signerPayloadJSON } = unsignedTxPayload;

      await send({ signerPayloadJSON, signature: signature as `0x${string}` });
    } else {
      await this.uniqueSdk.extrinsics.submit({
        signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
        signature
      });
    }
  }

    // #region AUCTION

  transferToAuction(owner: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return this.transferToken(owner, this.auctionAddress, collectionId, tokenId, options);
  }

  // token
  async transferToken(from: Address, to: Address, collectionId: string, tokenId: string, { signer, send }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token = await this.uniqueSdk.tokens.get(tokenIdArguments);
    if (!token) throw new Error('Token not found');

    if (!isTokenOwner(from, token.owner)) throw new Error('You are not owner of this token');

    const unsignedTxPayload = await this.uniqueSdk.tokens.transfer.build({
      address: from,
      from,
      to,
      ...tokenIdArguments
    });

    const { signature } = await this.uniqueSdk.tokens.transfer.sign(unsignedTxPayload, { signer });

    if (!signature) throw new Error('Signing failed');

    if (send) {
      const { signerPayloadJSON } = unsignedTxPayload;

      await send({ signerPayloadJSON, signature: signature as `0x${string}` });
    } else {
      await this.uniqueSdk.extrinsics.submit({
        signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
        signature
      });
    }
  }

  // purchase
  async unlockNft(address: Address, collectionId: string, tokenId: string, { signer }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    const ethAddress = getEthAccount(address);

    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token: TokenByIdResponse | null = await this.uniqueSdk.tokens.get(tokenIdArguments);
    if (!token) throw new Error('Token for unlock not found');
    const owner = token.owner;

    if (owner && !isEthereumAddress(owner) && compareEncodedAddresses(owner, address)) return;

    const from: Record<string, string> = { ethereum: ethAddress };
    const to: Record<string, string> = { substrate: address };

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      section: 'unique',
      method: 'transferFrom',
      // @ts-ignore
      args: [from, to, tokenIdArguments.collectionId, tokenIdArguments.tokenId, 1],
      address: address,
      isImmortal: false
    });
    const { signature } = await this.uniqueSdk.extrinsics.sign(unsignedTxPayload, signer);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

    // account
    async transferBalance(address: Address, destination: string, amount: BN, { signer, send }: TransactionOptions): Promise<void> {
      if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
      const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
        section: 'balances',
        method: 'transfer',
        args: [destination, amount.toString()],
        address
      });

      const { signature } = await this.uniqueSdk.extrinsics.sign(unsignedTxPayload, signer);

      if (!signature) throw new Error('Signing failed');
      if (send) {
        const { signerPayloadJSON } = unsignedTxPayload;

        await send({ signerPayloadJSON, signature: signature as `0x${string}` });
      } else {
        await this.uniqueSdk.extrinsics.submit({
          signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
          signature
        });
      }
    }

    async transferBidBalance(address: Address, amount: BN, { signer, send }: TransactionOptions): Promise<void> {
      if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
      const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
        section: 'balances',
        method: 'transferKeepAlive',
        args: [this.auctionAddress, amount.toString()],
        address
      });

      const { signature } = await this.uniqueSdk.extrinsics.sign(unsignedTxPayload, signer);

      if (!signature) throw new Error('Signing failed');
      if (send) {
        const { signerPayloadJSON } = unsignedTxPayload;

        await send({ signerPayloadJSON, signature: signature as `0x${string}` });
      } else {
        await this.uniqueSdk.extrinsics.submit({
          signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
          signature
        });
      }
    }

    // #endregion auction

    // balance
    async getAccountBalance(address: Address): Promise<AllBalances> {
      if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
      return await this.uniqueSdk.balance.get({ address });
    }

    // fee
    async getFee(sender: Address, recipient?: string, value?: BN): Promise<string | null> {
      if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
      const transferFee = await this.uniqueSdk.extrinsics.getFee({
        address: sender,
        section: 'balances',
        method: 'transfer',
        args: [
          recipient || '',
          value?.toString() || '0'
        ]
      });
      return transferFee.amount;
    }
}
