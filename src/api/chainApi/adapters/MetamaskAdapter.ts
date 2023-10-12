import { UniqueNFTFactory, UniqueFungibleFactory, UniqueRefungibleTokenFactory } from '@unique-nft/solidity-interfaces';
import { Address, EthCrossAccountId } from '@unique-nft/utils';
import { Contract, ethers, Signer } from 'ethers';
import IMarketContractAdapter, { IMarketContractProperties } from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';
import { CollectionMode } from '../types';
import { CollectionProperty } from '@unique-nft/sdk';
import { Utf16 } from 'utf-helpers';

const buyGasLimit = 1_000_000;
const sellGasLimit = 200_000;
class MetamaskAdapter implements IMarketContractAdapter {
  private getContract(signer: Signer, contract: IMarketContractProperties) {
    return new ethers.Contract(contract.address, marketplaceAbi, signer);
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

  async setCollectionProperties(collectionId: number, properties: CollectionProperty[], signer: Signer): Promise<void> {
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    const encodedProperties = properties.map(({ key, value }) => ({
      key,
      value: Utf16.stringToNumberArray(value || '')
    }));
    await (await nftFactory.setCollectionProperties(encodedProperties, { from: await signer.getAddress() })).wait();
  }

  async getTransferTokenFee(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, signer: Signer): Promise<string> {
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId, tokenId }, signer)
      : UniqueNFTFactory(collectionId, signer));
    const estimateGas = await tokenHelper.estimateGas.transferFromCross(
      fromCross,
      toCross,
      mode === 'ReFungible' ? amount : tokenId
    );
    const gasPrice = await tokenHelper.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, mode: CollectionMode, amount: number, signer: Signer): Promise<void> {
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId, tokenId }, signer)
      : UniqueNFTFactory(collectionId, signer));
    await (await tokenHelper.transferFromCross(
      fromCross,
      toCross,
      mode === 'ReFungible' ? amount : tokenId
    )).wait();
  }

  async getNestTokenFee(address: string, nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<string> {
    const newParentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: nested.collectionId, tokenId: nested.tokenId }, signer)
      : UniqueNFTFactory(nested.collectionId, signer));

    // const originalParentTokenAddress = await tokenHelper.ownerOf(nested.tokenId);

    const estimateGas = await tokenHelper.estimateGas.transferFrom(
      address,
      newParentTokenAddress,
      mode === 'ReFungible' ? amount : nested.tokenId
    );
    const gasPrice = await tokenHelper.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async nestToken(address: string, nested: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<void> {
    const newParentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: nested.collectionId, tokenId: nested.tokenId }, signer)
      : UniqueNFTFactory(nested.collectionId, signer));

    await (await tokenHelper.transferFrom(
      address,
      newParentTokenAddress,
      mode === 'ReFungible' ? amount : nested.tokenId
    )).wait();
  }

  async getUnnestTokenFee(target: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<string> {
    const parentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: target.collectionId, tokenId: target.tokenId }, signer)
      : UniqueNFTFactory(target.collectionId, signer));

    const ownerAddress = await signer.getAddress();

    const estimateGas = await tokenHelper.estimateGas.transferFrom(
      parentTokenAddress,
      ownerAddress,
      mode === 'ReFungible' ? amount : target.tokenId
    );
    const gasPrice = await tokenHelper.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async unnestToken(target: NestTokenParam, parent: NestTokenParam, mode: CollectionMode, amount: number, signer: Signer): Promise<void> {
    const parentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: target.collectionId, tokenId: target.tokenId }, signer)
      : UniqueNFTFactory(target.collectionId, signer));

    const ownerAddress = await signer.getAddress();
    await (await tokenHelper.transferFrom(
      parentTokenAddress,
      ownerAddress,
      mode === 'ReFungible' ? amount : target.tokenId
    )).wait();
  }

  async getTransferBalanceFee(addressFrom: string, addressTo: string, amount: ChainValue, signer: Signer): Promise<string> {
    const from = Address.extract.ethCrossAccountId(addressFrom);
    const to = Address.extract.ethCrossAccountId(addressTo);

    const uniqueFungible = await UniqueFungibleFactory(0, signer);
    const estimateGas = await uniqueFungible.estimateGas.transferFromCross(
      from, to, amount.raw, { from: addressFrom }
    );
    const gasPrice = await uniqueFungible.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async transferBalance(addressFrom: string, addressTo: string, amount: ChainValue, signer: Signer): Promise<void> {
    // TODO await signer.checkNetwork?.();
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

  async getSellFee(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(signer, contractProps);
    const gasPrice = await contract.provider.getGasPrice();
    const estimateGas = await contract.provider.estimateGas({
      from: from.eth,
      gasLimit: sellGasLimit,
      gasPrice
    });
    return estimateGas.mul(gasPrice).toString();
  }

  async sell(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<void> {
    const contract = this.getContract(signer, contractProps);
    await this.callContract(contract, 'put', collectionId, tokenId, price, amount, from, { gasLimit: sellGasLimit });
  }

  async getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(signer, contractProps);
    const estimateGas = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { value: price, gasLimit: buyGasLimit });
    const gasPrice = await contract.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async buy(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<void> {
    const contract = this.getContract(signer, contractProps);

    const estimateGas = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { value: price, gasLimit: buyGasLimit });
    await this.callContract(contract, 'buy', collectionId, tokenId, amount, to, { value: price, gasLimit: estimateGas.add(1000) });
  }

  async changePrice(collectionId: number, tokenId: number, price: string, signer: Signer, contractProps: IMarketContractProperties): Promise<void> {
    const contract = this.getContract(signer, contractProps);

    const estimateGas = await contract.estimateGas.changePrice(collectionId, tokenId, { value: price, gasLimit: buyGasLimit });
    await this.callContract(contract, 'changePrice', collectionId, tokenId, { value: price, gasLimit: estimateGas.add(1000) });
  }

  async getChangePriceFee(collectionId: number, tokenId: number, price: string, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(signer, contractProps);

    const estimateGas = await contract.estimateGas.changePrice(collectionId, tokenId, { value: price, gasLimit: buyGasLimit });
    const gasPrice = await contract.provider.getGasPrice();

    return estimateGas.mul(gasPrice).toString();
  }
}

export default MetamaskAdapter;
