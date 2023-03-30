import { BN } from '@polkadot/util';

import { Address } from '@unique-nft/utils';
import { UniqueNFTFactory, UniqueFungibleFactory } from '@unique-nft/solidity-interfaces';
import { Address as AccountAddress } from '@unique-nft/substrate-client/types';
import { AllBalances } from '@unique-nft/substrate-client/balance';
import { TransactionOptions } from '../types';
import IMarketController from './base/IMarketController';
import MetamaskController from './base/MetamaskController';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { ethers, Signer } from 'ethers';

export class MarketMetamaskController extends MetamaskController implements IMarketController {
  private getContract(signer: Signer) {
    return new ethers.Contract(this.contractAddress, marketplaceAbi, signer);
  }

  // TODO: take signer from provider or actually demand it in params?
  async changeAllowance(collectionId: number, tokenId: number, targetAllowance: boolean, options: TransactionOptions): Promise<void> {
    // @ts-ignore // TODO: fix typing for signer
    const nftFactory = await UniqueNFTFactory(collectionId, options.signer.signer);
    const from = options.signer.address;
    // provide allowance to SC or remove it by sending allowance to null
    const to = this.contractAddress;

    const isApproved = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (isApproved.isAllowed === targetAllowance) { return; }
    await (await nftFactory.approve(to, tokenId)).wait();
  }

  async sellFix(collectionId: number, tokenId: number, price: number, amount: number, options: TransactionOptions): Promise<void> {
    const from = options.signer.address;
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (!isAllowed) throw new Error('Token not approved for sale');
    const contract = this.getContract(options.signer.signer);
    const res = await contract.put(collectionId, tokenId, price, amount);
    // TODO: await result
  }

  async buyFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    const from = options.signer.address;
    const to = this.contractAddress;
    const isAllowed = await this.uniqueSdk.tokens.allowance({ collectionId, tokenId, from, to });
    if (!isAllowed) throw new Error('Token not approved for sale');
    const contract = this.getContract(options.signer.signer);
    const value = (await this.getOrder(collectionId, tokenId))[3]; // order.value
    const res = await contract.buy(collectionId, tokenId, amount);
    // TODO: await result
  }

  async cancelFix(collectionId: number, tokenId: number, amount: number, options: TransactionOptions): Promise<void> {
    // throws error if not found
    await this.getOrder(collectionId, tokenId);
    await this.changeAllowance(collectionId, tokenId, false, options);
  }

  async getOrder(collectionId: number, tokenId: number): Promise<any> {
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

  async getAccountBalance(address: string): Promise<AllBalances> {
    return await this.uniqueSdk.balance.get({ address });
  }

  async transferToken(from: string, to: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    // TODO: fix typing for signer
    const nftFactory = await UniqueNFTFactory(Number(collectionId), options.signer.signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await nftFactory.transferFromCross(fromCross, toCross, tokenId)).wait();
  }

  async getFee(sender: AccountAddress, recipient?: string, value?: BN): Promise<string | null> {
    await Promise.resolve();
    return '0';
  }

  async transferBalance(from: AccountAddress, to: string, amount: BN, { signer, send }: TransactionOptions): Promise<void> {
    // @ts-ignore
    const fungibleFactory = await UniqueFungibleFactory(from, signer.signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await fungibleFactory.transferFromCross(fromCross, toCross, amount.toString())).wait();
  }
}

export default MarketMetamaskController;
