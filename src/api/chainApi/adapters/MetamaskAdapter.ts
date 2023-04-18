import { UniqueFungibleFactory, UniqueNFTFactory } from '@unique-nft/solidity-interfaces';
import { Address } from '@unique-nft/utils';
import { ethers, Signer } from 'ethers';
import IMarketContractAdapter from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';

class MetamaskAdapter implements IMarketContractAdapter {
  contractAddress: string;
  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  private getContract(signer: Signer) {
    console.log(this.contractAddress, marketplaceAbi, signer);
    return new ethers.Contract(this.contractAddress, marketplaceAbi, signer);
  }

  async transferToken(from: string, to: string, collectionId: number, tokenId: number, signer: Signer): Promise<void> {
    const nftFactory = await UniqueNFTFactory(Number(collectionId), signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await nftFactory.transferFromCross(fromCross, toCross, tokenId)).wait();
  }

  async transferBalance(from: string, to: string, amount: number, signer: Signer): Promise<void> {
    const fungibleFactory = await UniqueFungibleFactory(from, signer);
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    await (await fungibleFactory.transferFromCross(fromCross, toCross, amount.toString())).wait();
  }

  async changeAllowance(from: string, to: string, collectionId: number, tokenId: number, targetAllowance: boolean, signer: Signer): Promise<void> {
    // in order to remove allowance - we just set approve to void
    const targetTo = targetAllowance ? to : '0x00';
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    await (await nftFactory.approve(targetTo, tokenId)).wait();
  }

  async sell(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void> {
    const contract = this.getContract(signer);
    await (await contract.put(collectionId, tokenId, price, amount, { gasLimit: 10000000 })).wait();
  }

  async buy(from: string, collectionId: number, tokenId: number, price: number, amount: number, signer: Signer): Promise<void> {
    const contract = this.getContract(signer);
    console.log('calling contract for metamask', collectionId, tokenId, amount, price);
    await (await contract.buy(collectionId, tokenId, amount, { gasLimit: 10000000, value: ethers.utils.parseEther(price.toString()) })).wait();
  }
}

export default MetamaskAdapter;
