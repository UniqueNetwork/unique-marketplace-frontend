import { ExtrinsicResultResponse, Sdk, Signer } from '@unique-nft/sdk/full';
import { Address, EthCrossAccountId } from '@unique-nft/utils';
import IMarketContractAdapter, { IMarketContractProperties } from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';
import { CollectionMode, TransferTokenParams } from '../types';
import { CollectionProperty, TokenId } from '@unique-nft/sdk';

const buyGasLimit = 1_000_000;
const sellGasLimit = 200_000;
class UniqueAdapter implements IMarketContractAdapter {
  constructor(uniqueSdk: Sdk) {
    this.uniqueSdk = uniqueSdk;
  }

  protected uniqueSdk: Sdk;

  private validateSdkResponse(result: ExtrinsicResultResponse<any>) {
    if (result.error) throw new Error((result.error as any)?.message || 'Transaction failed');
  }

  async setCollectionProperties(collectionId: number, properties: CollectionProperty[], signer: Signer): Promise<void> {
    const unsignedTxPayload = await this.uniqueSdk.collection.setProperties.build({
      address: signer.address,
      collectionId,
      properties
    });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collection.setProperties.sign(unsignedTxPayload, { signer });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.collection.setProperties.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
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
      res = await this.uniqueSdk.refungible.transferToken.submitWaitResult({
        address: signer.address,
        from,
        to: signer.address,
        amount,
        collectionId: nested.collectionId,
        tokenId: nested.tokenId
      }, { signer });
    } else {
      res = await this.uniqueSdk.token.unnest.submitWaitResult({
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

  async getSellFee(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<string> {
    const res = await this.uniqueSdk.evm.send.getFee({
      abi: contract.abi || marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: contract.address,
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

  async sell(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<void> {
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: contract.abi || marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: contract.address,
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

  async getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<string> {
    const res = await this.uniqueSdk.evm.send.getFee({
      abi: contract.abi || marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: contract.address,
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

  async buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contract: IMarketContractProperties): Promise<void> {
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: contract.abi || marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: contract.address,
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

  async changePrice(collectionId: number, tokenId: number, price: string, signer: Signer, contract: IMarketContractProperties): Promise<void> {
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: contract.abi || marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: contract.address,
      funcName: 'changePrice',
      gasLimit: buyGasLimit,
      args: {
        collectionId,
        tokenId,
        price
      }
    }, { signer });
  }

  async getChangePriceFee(collectionId: number, tokenId: number, price: string, signer: Signer, contract: IMarketContractProperties): Promise<string> {
    const res = await this.uniqueSdk.evm.send.getFee({
      abi: contract.abi || marketplaceAbi as any,
      address: signer.address || '',
      contractAddress: contract.address,
      funcName: 'changePrice',
      gasLimit: buyGasLimit,
      args: {
        collectionId,
        tokenId,
        price
      }
    });
    return res.fee.raw;
  }

  async transferTokensBatch(transfers: TransferTokenParams[], signer: Signer, onSubmittedOne?: (token: TokenId, index: number) => void): Promise<void> {
    // TODO: extend this method to RFT
    // const method = mode === 'ReFungible' ? this.uniqueSdk.refungible.transferToken : this.uniqueSdk.token.transfer;
    const unnestTransfers: TransferTokenParams[] = [];
    const nestTransfers: TransferTokenParams[] = [];

    transfers.forEach((params) => {
      if (params.from !== signer.address) {
        unnestTransfers.push(params);
      } else {
        nestTransfers.push(params);
      }
    });

    const txToUnnest = await this.uniqueSdk.token.unnest.buildBatch(unnestTransfers.map(({ token, to }) => ({
      nested: token,
      to,
      address: signer.address
    }), { signer }));

    const txToNest = await this.uniqueSdk.token.transfer.buildBatch(nestTransfers.map(({ token, from, to }) => ({
      collectionId: token.collectionId,
      tokenId: token.tokenId,
      from,
      to,
      address: from === signer.address ? signer.address : from
    }), { signer, nonce: txToUnnest.nextNonce }));

    await Promise.all([
      ...txToUnnest.payloads.map(async (tx, index) => {
        await this.uniqueSdk.token.unnest.submitWaitResult(tx, { signer, nonce: txToUnnest.nextNonce + index });
        onSubmittedOne?.(unnestTransfers[index].token, index);
      }),
      ...txToNest.payloads.map(async (tx, index) => {
        await this.uniqueSdk.token.transfer.submitWaitResult(tx, {
          signer,
          nonce: txToUnnest.nextNonce + unnestTransfers.length + 1 + index
        });
        onSubmittedOne?.(nestTransfers[index].token, index);
      })
    ]);
  }
}

export default UniqueAdapter;
