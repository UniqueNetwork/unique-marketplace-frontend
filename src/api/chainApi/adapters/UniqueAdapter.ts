import { Sdk, Signer } from '@unique-nft/sdk/full';
import IMarketContractAdapter from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';

class UniqueAdapter implements IMarketContractAdapter {
  constructor(contractAddress: string, uniqueSdk: Sdk) {
    this.uniqueSdk = uniqueSdk;
    this.contractAddress = contractAddress;
  }

  protected contractAddress: string;
  protected uniqueSdk: Sdk;

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, signer: Signer): Promise<void> {
    await this.uniqueSdk.token.transfer.submitWaitResult({
      address: from,
      from,
      to,
      collectionId,
      tokenId
    }, { signer });
  }

  async transferBalance(from: string, to: string, amount: number, signer: Signer): Promise<void> {
    await this.uniqueSdk.balance.transfer.submitWaitResult({
      address: from,
      destination: to,
      amount
    }, { signer });
  }

  async changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void> {
    await this.uniqueSdk.token.approve.submitWaitResult({ collectionId, tokenId, spender: to, address: from, isApprove: targetAllowance }, { signer });
  }

  async sell(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void> {
    // console.log('signer', signer, 'signer.sign', signer.sign);
    // await (await this.uniqueSdk.evm.contractConnect(this.contractAddress, marketplaceAbi)).send.submitWaitResult({
    //   address: from,
    //   funcName: 'put',
    //   args: [collectionId, tokenId, price, amount] // TODO: fix after sdk update
    // }, { signer });
    // return;
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: marketplaceAbi as any,
      address: from,
      contractAddress: this.contractAddress,
      funcName: 'put',
      args: {
        collectionId,
        tokenId,
        price,
        amount
      }
      // args: [collectionId, tokenId, price, amount]
    }, { signer });
  }

  async buy(from: string, collectionId: number, tokenId: number, value: number, amount: number, signer: Signer): Promise<void> {
    await this.uniqueSdk.evm.send.submitWaitResult({
      abi: marketplaceAbi as any,
      address: from,
      contractAddress: this.contractAddress,
      value: BigInt('5' + '0'.repeat(18)).toString(16),
      funcName: 'buy',
      args: [collectionId, tokenId, amount] as any // TODO: fix after sdk update
    }, { signer });
  }
}

export default UniqueAdapter;
