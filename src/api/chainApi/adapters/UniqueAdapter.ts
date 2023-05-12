import { ExtrinsicResultResponse, Sdk, Signer } from '@unique-nft/sdk/full';
import { EthCrossAccountId } from '@unique-nft/utils';
import IMarketContractAdapter from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';

class UniqueAdapter implements IMarketContractAdapter {
  constructor(contractAddress: string, uniqueSdk: Sdk) {
    this.uniqueSdk = uniqueSdk;
    this.contractAddress = contractAddress;
  }

  protected contractAddress: string;
  protected uniqueSdk: Sdk;

  private validateSdkResponse(result: ExtrinsicResultResponse<any>) {
    if (result.error) throw new Error((result.error as any)?.message || 'Transaction failed');
  }

  async getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, amount: number): Promise<string> {
    if (amount !== 1) throw new Error('RFT support not implemented');
    const res = await this.uniqueSdk.token.transfer.getFee({
      address: from,
      from,
      to,
      collectionId,
      tokenId
    });
    return res.fee.raw;
  }

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT support not implemented');
    this.validateSdkResponse(await this.uniqueSdk.token.transfer.submitWaitResult({
      address: from,
      from,
      to,
      collectionId,
      tokenId
    }, { signer }));
  }

  async nestToken(from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT support not implemented');
    const res = await this.uniqueSdk.token.nest({
      address: signer.address || '',
      nested: from,
      parent: to
    }, { signer });
    if (res.error) {
      console.error('Nest failed: ', res.error);
      throw new Error(res.error.toString());
    }
  }

  async unnestToken(from: NestTokenParam, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT support not implemented');
    const res = await this.uniqueSdk.token.unnest({
      address: signer.address || '',
      nested: from
    }, { signer });
    if (res.error) {
      console.error('Unnest failed: ', res.error);
      throw new Error(res.error.toString());
    }
  }

  async getTransferBalanceFee(from: string, to: string, amount: ChainValue): Promise<string> {
    const res = (await this.uniqueSdk.balance.transfer.getFee({
      address: from,
      destination: to,
      amount: amount.parsed
    }));
    return res.fee.raw;
  }

  async transferBalance(from: string, to: string, amount: ChainValue, signer: Signer): Promise<void> {
    await this.uniqueSdk.balance.transfer.submitWaitResult({
      address: from,
      destination: to,
      amount: amount.parsed
    }, { signer });
  }

  async changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void> {
    await this.uniqueSdk.token.approve.submitWaitResult({ collectionId, tokenId, spender: to, address: from, isApprove: targetAllowance }, { signer });
  }

  async getSellFee(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string> {
    const res = await this.uniqueSdk.evm.send.getFee({
      abi: marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: this.contractAddress,
      funcName: 'put',
      args: {
        collectionId,
        tokenId,
        price,
        amount,
        seller: from
      }
    });
    return res.fee.raw;
  }

  async sell(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void> {
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: this.contractAddress,
      funcName: 'put',
      args: {
        collectionId,
        tokenId,
        price,
        amount,
        seller: from
      }
    }, { signer });
  }

  async getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string> {
    const res = await this.uniqueSdk.evm.send.getFee({
      abi: marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: this.contractAddress,
      value: price,
      funcName: 'buy',
      args: {
        collectionId,
        tokenId,
        amount,
        buyer: to
      }
    });
    return res.fee.raw;
  }

  async buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void> {
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: this.contractAddress,
      value: price,
      funcName: 'buy',
      args: {
        collectionId,
        tokenId,
        amount,
        buyer: to
      }
    }, { signer });
  }
}

export default UniqueAdapter;
