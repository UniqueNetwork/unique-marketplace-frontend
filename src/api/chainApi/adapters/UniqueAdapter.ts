import { ExtrinsicResultResponse, Sdk, Signer } from '@unique-nft/sdk/full';
import { Address, EthCrossAccountId } from '@unique-nft/utils';
import IMarketContractAdapter from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';
import { CollectionMode } from '../types';

const buyGasLimit = 1_000_000;
const sellGasLimit = 200_000;
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

  async getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number): Promise<string> {
    const method = mode === 'ReFungible' ? this.uniqueSdk.refungible.transferToken : this.uniqueSdk.token.transfer;
    const res = await method.getFee({
      address: from,
      from,
      to,
      amount,
      collectionId,
      tokenId
    });
    return res.fee.raw;
  }

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, signer: Signer): Promise<void> {
    const method = mode === 'ReFungible' ? this.uniqueSdk.refungible.transferToken : this.uniqueSdk.token.transfer;
    this.validateSdkResponse(await method.submitWaitResult({
      address: from,
      from,
      to,
      amount,
      collectionId,
      tokenId
    }, { signer }));
  }

  async getNestTokenFee(address: string, nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<string> {
    if (mode === 'ReFungible') {
      const to = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
      const res = await this.uniqueSdk.refungible.transferToken.getFee({
        address: signer.address,
        from: address,
        to,
        amount,
        collectionId: nested.collectionId,
        tokenId: nested.tokenId
      });
      return res.fee.raw;
    }
    const res = await this.uniqueSdk.token.nest.getFee({
      address: signer.address || '',
      nested,
      parent
    });
    return res.fee.raw;
  }

  async nestToken(address: string, nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<void> {
    let res;
    if (address !== signer.address) {
      // token is already nested
      const to = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);

      const method = mode === 'ReFungible' ? this.uniqueSdk.refungible.transferToken : this.uniqueSdk.token.transfer;

      res = await method({
        address: signer.address,
        from: address,
        to,
        collectionId: nested.collectionId,
        tokenId: nested.tokenId
      }, { signer });
    } else {
      if (mode === 'ReFungible') {
        const to = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
        res = await this.uniqueSdk.refungible.transferToken({
          address: signer.address,
          from: signer.address,
          to,
          amount,
          collectionId: nested.collectionId,
          tokenId: nested.tokenId
        }, { signer });
      } else {
        res = await this.uniqueSdk.token.nest({
          address: signer.address || '',
          nested: nested,
          parent: parent
        }, { signer });
      }
    }
    if (res.error) {
      console.error('Nest failed: ', res.error);
      throw new Error(res.error.toString());
    }
  }

  async getUnnestTokenFee(nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<string> {
    if (!signer.address) throw new Error('Signer unavailable');
    if (mode === 'ReFungible') {
      const from = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
      const res = await this.uniqueSdk.refungible.transferToken.getFee({
        address: signer.address,
        from,
        to: signer.address,
        amount,
        collectionId: nested.collectionId,
        tokenId: nested.tokenId
      });
      return res.fee.raw;
    }

    const res = await this.uniqueSdk.token.unnest.getFee({
      address: signer.address || '',
      nested
    });
    return res.fee.raw;
  }

  async unnestToken(nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<void> {
    if (!signer.address) throw new Error('Signer unavailable');
    let res;
    if (mode === 'ReFungible') {
      const from = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
      res = await this.uniqueSdk.refungible.transferToken({
        address: signer.address,
        from,
        to: signer.address,
        amount,
        collectionId: nested.collectionId,
        tokenId: nested.tokenId
      });
    } else {
      res = await this.uniqueSdk.token.unnest({
        address: signer.address || '',
        nested
      }, { signer });
    }
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
    // withdraw
    if (Address.is.ethereumAddress(from)) {
      await this.uniqueSdk.extrinsic.submitWaitResult({
        section: 'evm',
        method: 'withdraw',
        address: signer.address || '',
        args: [from, amount.raw]
      }, signer);
      return;
    }
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
      gasLimit: sellGasLimit,
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
      gasLimit: sellGasLimit,
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
      gasLimit: buyGasLimit,
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
      gasLimit: buyGasLimit,
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
