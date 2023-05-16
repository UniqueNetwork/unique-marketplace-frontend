import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
import { Address, EthCrossAccountId } from '@unique-nft/utils';
import { Contract, ethers, Signer } from 'ethers';
import IMarketContractAdapter from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';

class MetamaskAdapter implements IMarketContractAdapter {
  contractAddress: string;
  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  private getContract(signer: Signer) {
    return new ethers.Contract(this.contractAddress, marketplaceAbi, signer);
  }

  private async validateCall(method: (methodArgs: any[]) => Promise<void>, ...args: any[]) {
    try {
      await method(args);
    } catch (e) {
      console.error('Call static failed: ', e);
      throw new Error('Calling contract method will fail, aborting');
    }
  }

  protected async callContract(contract: Contract, methodName: string, ...args: any[]) {
    await this.validateCall(contract.callStatic[methodName], args);
    await (await contract[methodName](args)).wait();
  }

  async getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<string> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    const fee = await nftFactory.estimateGas.transferFromCross(
      fromCross,
      toCross,
      tokenId
    );
    return fee.toString();
  }

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(collectionId), signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await nftFactory.transferFromCross(fromCross, toCross, tokenId)).wait();
  }

  async nestToken(from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactoryFrom = await UniqueNFTFactory(Number(from.collectionId), signer);

    const originalParentTokenAddress = await nftFactoryFrom.ownerOf(from.tokenId);
    const newParentTokenAddress = Address.nesting.idsToAddress(to.collectionId, to.tokenId);

    await (await nftFactoryFrom.transferFrom(originalParentTokenAddress, newParentTokenAddress, from.tokenId)).wait();
  }

  async unnestToken(target: NestTokenParam, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(target.collectionId), signer);

    const parentTokenAddress = await nftFactory.ownerOf(target.tokenId);
    const ownerAddress = await signer.getAddress();

    await (await nftFactory.transferFrom(parentTokenAddress, ownerAddress, target.tokenId)).wait();
  }

  async getTransferBalanceFee(from: string, to: string, amount: ChainValue, signer: Signer): Promise<string> {
    const toCross = Address.extract.ethCrossAccountId(to);
    const fee = await signer.estimateGas({ to: toCross.eth, value: amount.raw });
    return fee.toString();
  }

  async transferBalance(from: string, to: string, amount: ChainValue, signer: Signer): Promise<void> {
    // const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await signer.sendTransaction({ to: toCross.eth, value: amount.raw })).wait();
  }

  async changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void> {
    // in order to remove allowance - we just set approve to void
    const targetTo = targetAllowance ? to : '0x00';
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    await (await nftFactory.approve(targetTo, tokenId)).wait();
  }

  async getSellFee(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string> {
    const contract = this.getContract(signer);
    const fee = await contract.estimateGas.put(collectionId, tokenId, price, amount, from, { gasLimit: 10000000 });
    return fee.toString();
  }

  async sell(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void> {
    const contract = this.getContract(signer);
    await this.callContract(contract, 'put', collectionId, tokenId, price, amount, from, { gasLimit: 10000000 });
  }

  async getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string> {
    const contract = this.getContract(signer);
    const fee = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { gasLimit: 10000000, value: price });
    return fee.toString();
  }

  async buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void> {
    const contract = this.getContract(signer);
    await this.callContract(contract, 'buy', collectionId, tokenId, amount, to, { gasLimit: 10000000, value: price });
  }
}

export default MetamaskAdapter;
