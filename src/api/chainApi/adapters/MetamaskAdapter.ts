import { UniqueFungibleFactory, UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
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

  private async validateCall(method: (...methodArgs: any[]) => Promise<void>, args: any[]) {
    try {
      await method(...args);
    } catch (e) {
      console.error('Call static failed: ', e);
      throw new Error('Calling contract method will fail, aborting');
    }
  }

  protected async callContract(contract: Contract, methodName: string, ...args: any[]) {
    await this.validateCall(contract.callStatic[methodName], args);
    await (await contract[methodName](...args)).wait();
  }

  async getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<string> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    const estimateGas = await nftFactory.estimateGas.transferFromCross(
      fromCross,
      toCross,
      tokenId
    );
    const gasPrice = await nftFactory.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(collectionId), signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await nftFactory.transferFromCross(fromCross, toCross, tokenId)).wait();
  }

  async getNestTokenFee(from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<string> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(from.collectionId), signer);
    const originalParentTokenAddress = await nftFactory.ownerOf(from.tokenId);
    const newParentTokenAddress = Address.nesting.idsToAddress(to.collectionId, to.tokenId);
    const estimateGas = await nftFactory.estimateGas.transferFrom(
      originalParentTokenAddress,
      newParentTokenAddress,
      from.tokenId
    );
    const gasPrice = await nftFactory.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async nestToken(address: string, from: NestTokenParam, to: NestTokenParam, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(from.collectionId), signer);

    const originalParentTokenAddress = await nftFactory.ownerOf(from.tokenId);
    const newParentTokenAddress = Address.nesting.idsToAddress(to.collectionId, to.tokenId);

    await (await nftFactory.transferFrom(originalParentTokenAddress, newParentTokenAddress, from.tokenId)).wait();
  }

  async getUnnestTokenFee(target: NestTokenParam, amount: number, signer: Signer): Promise<string> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(target.collectionId), signer);
    const parentTokenAddress = await nftFactory.ownerOf(target.tokenId);
    const ownerAddress = await signer.getAddress();
    const estimateGas = await nftFactory.estimateGas.transferFrom(
      parentTokenAddress,
      ownerAddress,
      target.tokenId
    );
    const gasPrice = await nftFactory.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async unnestToken(target: NestTokenParam, amount: number, signer: Signer): Promise<void> {
    if (amount !== 1) throw new Error('RFT not supported');
    const nftFactory = await UniqueNFTFactory(Number(target.collectionId), signer);

    const parentTokenAddress = await nftFactory.ownerOf(target.tokenId);
    const ownerAddress = await signer.getAddress();

    await (await nftFactory.transferFrom(parentTokenAddress, ownerAddress, target.tokenId)).wait();
  }

  async getTransferBalanceFee(from: string, to: string, amount: ChainValue, signer: Signer): Promise<string> {
    const toEth = Address.is.ethereumAddress(to) ? to : Address.mirror.substrateToEthereum(to);
    const gasPrice = await signer.getGasPrice();
    const estimateGas = await signer.estimateGas({ to: toEth, value: amount.raw });

    return estimateGas.mul(gasPrice).toString();
  }

  async transferBalance(addressFrom: string, addressTo: string, amount: ChainValue, signer: Signer): Promise<void> {
    const from = Address.extract.ethCrossAccountId(addressFrom);
    const to = Address.extract.ethCrossAccountId(addressTo);

    const uniqueFungible = await UniqueFungibleFactory(0, signer);
    await (await uniqueFungible.transferFromCross(from, to, amount.raw, { from: addressFrom })).wait();
  }

  async changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void> {
    const targetTo = targetAllowance ? to : from;
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    await (await nftFactory.approve(targetTo, tokenId)).wait();
  }

  async getSellFee(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string> {
    const contract = this.getContract(signer);
    const gasPrice = await contract.provider.getGasPrice();
    const estimateGas = await contract.provider.estimateGas({
      from: from.eth,
      gasLimit: 10000000,
      gasPrice
    });
    return estimateGas.mul(gasPrice).toString();
  }

  async sell(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void> {
    const contract = this.getContract(signer);
    await this.callContract(contract, 'put', collectionId, tokenId, price, amount, from, { gasLimit: 10000000 });
  }

  async getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<string> {
    const contract = this.getContract(signer);
    const estimateGas = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { value: price, gasLimit: 10000000 });
    const gasPrice = await contract.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer): Promise<void> {
    const contract = this.getContract(signer);

    const estimateGas = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { value: price, gasLimit: 10000000 });
    await this.callContract(contract, 'buy', collectionId, tokenId, amount, to, { value: price, gasLimit: estimateGas.add(1000) });
  }
}

export default MetamaskAdapter;
