import { Client, TokenByIdResponse } from '@unique-nft/sdk';
import { TokenIdArguments } from '@unique-nft/substrate-client/tokens';
import { isEthereumAddress } from '@unique-nft/substrate-client/utils';
import { AllBalances, Balance } from '@unique-nft/substrate-client/balance';
import { Address } from '@unique-nft/substrate-client/types';

import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { TransactionOptions, UniqueController } from './types';
import { getEthAccount, compareEncodedAddresses, isTokenOwner } from './utils/addressUtils';
import marketplaceAbi from './contracts/marketplace-0.json';

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
  private minPrice = 0.000001;
  private defaultGasAmount = 2500000;
  private contractAddress = '';
  private auctionAddress = '';
  decimals = 12;

  async setNetwork(options: UniqueSDKMarketControllerOptions) {
    this.uniqueSdk = options.uniqueSdk;
    // this.contractAddress = options.contractAddress;
    this.contractAddress = '0xbf198C5168E6BA2ef9E58e3d674d7F7eB2DfC96e';
    this.auctionAddress = options.auctionAddress;

    this.decimals = (await this.uniqueSdk.common.chainProperties()).decimals || 12;
  }

  public async changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, { signer, send }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('SDK isn\'t ready');
    if (!signer) throw new Error('Signer not provided');
    const from = signer.address;
    const to = this.contractAddress;
    const isAlreadyAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (isAlreadyAllowed.isAllowed === targetAllowance) return;
    const unsignedTxPayload = await this.uniqueSdk.tokens.approve.build({ collectionId, tokenId, spender: to, address: from, isApprove: targetAllowance });
    const { signature } = await this.uniqueSdk.tokens.approve.sign(unsignedTxPayload, { signer });

    if (!signature) throw new Error('Signing failed');

    if (send) {
      const { signerPayloadJSON } = unsignedTxPayload;

      await send({ signerPayloadJSON, signature: signature as `0x${string}` });
    } else {
      const res = await this.uniqueSdk.tokens.approve.submitWaitResult({
        signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
        signature
      });
      console.log('Failed to provide approve', res.error);
      if (res.error) throw new Error('Approve failed');
    }
  }

  // price in SC format
  // ex. to sell for 1 OPL - price=100000000000000000(18 decimals)
  // amount - "1" for NFT, and amount of pieces for RFT
  public async sellFix(collectionId: number, tokenId: number, price: number, amount: number, { signer, send }: TransactionOptions): Promise<void> {
    if (!signer) throw new Error('Signer not provided');
    if (!this.uniqueSdk) throw new Error('Sdk not provided');
    const address = signer.address;
    // const ethAddress = getEthAccount(address);
    const from = signer.address;
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (!isAllowed) throw new Error('Token not approved for sale');

    try {
      const res = await this.uniqueSdk.evm.send.submitWaitResult({
        abi: marketplaceAbi,
        address,
        contractAddress: this.contractAddress,
        funcName: 'put',
        args: [collectionId, tokenId, price, amount] as any // TODO: ???
      }, { signer });
      console.log('Put on sale');
      if (res.error) throw new Error('res.error');
    } catch (e) {
      console.log('FAILED TO PUT ON SALE', e);
    }
  }

  public async buyFix(collectionId: number, tokenId: number, amount: number, { signer, send }: TransactionOptions): Promise<void> {
    if (!signer) throw new Error('Signer not provided');
    if (!this.uniqueSdk) throw new Error('Sdk not provided');
    const address = signer.address;
    // const ethAddress = getEthAccount(address);
    const from = signer.address;
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (!isAllowed) throw new Error('Token not approved for sale');

    const value = 0; // order.value

    try {
      const res = await this.uniqueSdk.evm.send.submitWaitResult({
        abi: marketplaceAbi,
        address,
        contractAddress: this.contractAddress,
        value, // TODO: price goes here, from order or from SC?
        funcName: 'buy', // TODO: !!!! HOW TO GET COST FROM ORDER !? !? !? !?
        args: [collectionId, tokenId, amount] as any // TODO: ???
      }, { signer });
      console.log('Put on sale');
      if (res.error) throw new Error('res.error');
    } catch (e) {
      console.log('FAILED TO PUT ON SALE', e);
    }
  }

  // TODO: type for order
  private async getOrder(collectionId: number, tokenId: number): Promise<any> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!collectionId || !tokenId) throw new Error(`Cant get order for ${collectionId}-${tokenId}`);
    try {
      const res = await this.uniqueSdk.evm.call({
        abi: marketplaceAbi,
        address: '5EALag5gFWyjbz9kYV5VNUr7tjg9MrAMg2nZhWwSmAHdaiZp', // TODO: this arg makes no sense, cant skip
        contractAddress: this.contractAddress,
        funcName: 'getOrder',
        args: [collectionId, tokenId] as any // TODO: ???
      });
      console.log('Order found', res);
      return res; // TODO: works, but result makes no sense
    } catch (e) {
      console.error('Failed to get order', e);
      throw e;
    }
  }

  public async cancelFix(collectionId: number, tokenId: number, amount: number, { signer, send }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    // check if order exist
    try {
      await this.getOrder(collectionId, tokenId);
      // TODO: extra check for allowance = false
    } catch (e) {
      console.log('Order not found');
      return;
    }
    // cancel order
    try {
      const res = await this.uniqueSdk.evm.send.submitWaitResult({
        abi: marketplaceAbi,
        address: '5EALag5gFWyjbz9kYV5VNUr7tjg9MrAMg2nZhWwSmAHdaiZp', // TODO: this arg makes no senswe
        contractAddress: this.contractAddress,
        funcName: 'revoke',
        args: [collectionId, tokenId, amount] as any // TODO: ???
      }, { signer });
      console.log('Order found', res);
      return; // TODO: works, but result makes no sense
    } catch (e) {
      console.error('Failed to get order', e);
      throw e;
    }
  }

    // #region AUCTION

  transferToAuction(owner: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return this.transferToken(owner, this.auctionAddress, collectionId, tokenId, options);
  }

  // token
  async transferToken(from: Address, to: Address, collectionId: string, tokenId: string, { signer, send }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready'); // TODO: make this.uniqueSdk mandatory (dont check for it in every function)
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
