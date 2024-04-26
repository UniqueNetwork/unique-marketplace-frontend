import { Contract, ethers, Signer } from 'ethers';
import { UniqueCollectionSchemaDecoded, UniqueTokenToCreate, SchemaTools } from '@unique-nft/schemas';
import { IV2Token, SchemaTools as SchemaToolsV2 } from '@unique-nft/schemas-v2';
import { CollectionProperty, CreateCollectionParsed, CreateCollectionV2ArgsDto, TokenV2ItemForMultipleDto, PropertyKeyPermission, SetCollectionLimitsBody, SetSponsorshipBody, TokenId, CreateTokenPayload } from '@unique-nft/sdk';
import { UniqueNFTFactory, UniqueFungibleFactory, UniqueRefungibleTokenFactory, CollectionHelpersFactory, parseEthersV5TxReceipt } from '@unique-nft/solidity-interfaces';
import { EthCrossAccountId, Address } from '@unique-nft/utils';
import { Utf8 } from 'utf-helpers';
import IMarketContractAdapter, { IMarketContractProperties } from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';
import { CollectionMode, TransferTokenParams } from '../types';
import { sleep } from 'utils/helpers';

const buyGasLimit = 1_000_000;
const sellGasLimit = 200_000;

enum TPP {
  /// Permission to change the property and property permission. See [`up_data_structs::PropertyPermission::mutable`]
  Mutable,
  /// Change permission for the collection administrator. See [`up_data_structs::PropertyPermission::token_owner`]
  TokenOwner,
  /// Permission to change the property for the owner of the token. See [`up_data_structs::PropertyPermission::collection_admin`]
  CollectionAdmin
}

const TPP_TO_TPP: {[K: string]: TPP} = {
  mutable: TPP.Mutable,
  collectionAdmin: TPP.CollectionAdmin,
  tokenOwner: TPP.TokenOwner
};

class MetamaskAdapter implements IMarketContractAdapter {
  private getContract(signer: Signer, contract: IMarketContractProperties) {
    return new ethers.Contract(contract.address, (contract.abi as ethers.ContractInterface) || marketplaceAbi, signer);
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

    const estimateGas = await contract.estimateGas.changePrice(collectionId, tokenId, price, { gasLimit: buyGasLimit });
    await this.callContract(contract, 'changePrice', collectionId, tokenId, price, { gasLimit: estimateGas.add(1000) });
  }

  async getChangePriceFee(collectionId: number, tokenId: number, price: string, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(signer, contractProps);

    const estimateGas = await contract.estimateGas.changePrice(collectionId, tokenId, price, { value: price, gasLimit: buyGasLimit });
    const gasPrice = await contract.provider.getGasPrice();

    return estimateGas.mul(gasPrice).toString();
  }

  async transferTokensBatch(transfers: TransferTokenParams[], signer: Signer, onSubmittedOne?: (token: TokenId, index: number) => void): Promise<void> {
    await Promise.all(transfers.map(async ({ token, from, to, mode, amount }, index) => {
      const { collectionId, tokenId } = token;
      const fromCross = Address.extract.ethCrossAccountId(from);
      const toCross = Address.extract.ethCrossAccountId(to);
      await sleep(100);
      const tokenHelper = await (mode === 'ReFungible'
        ? UniqueRefungibleTokenFactory({ collectionId, tokenId }, signer)
        : UniqueNFTFactory(collectionId, signer));
      await (await tokenHelper.transferFromCross(
        fromCross,
        toCross,
        mode === 'ReFungible' ? amount : tokenId
      )).wait();
      onSubmittedOne?.(token, index);
    }));
  }

  async getCreateCollectionFee({ address, tokenPrefix, description, name }: CreateCollectionV2ArgsDto, signer: Signer): Promise<string> {
    const collectionHelper = await CollectionHelpersFactory(signer);

    const fee = await collectionHelper.collectionCreationFee();
    const estimateGas = await collectionHelper.estimateGas.createNFTCollection(
      name,
      description,
      tokenPrefix || name.slice(0, 4),
      {
        from: address,
        value: fee
      }
    );
    const gasPrice = await collectionHelper.provider.getGasPrice();
    const decimalNumber = parseFloat(ethers.utils.formatEther(estimateGas.mul(gasPrice)));
    return String(decimalNumber);
  }

  async createCollection({ name, description, tokenPrefix, address }: CreateCollectionV2ArgsDto, signer: Signer): Promise<CreateCollectionParsed | undefined> {
    const collectionHelpers = await CollectionHelpersFactory(signer);
    const createCollectionResult = parseEthersV5TxReceipt(
      await(
        await collectionHelpers.createNFTCollection(
          name,
          description,
          tokenPrefix || name.slice(0, 4),
          {
            from: address,
            value: await collectionHelpers.collectionCreationFee()
          }
        )
      ).wait()
    );

    const collectionAddress = createCollectionResult.events.CollectionCreated.collectionId; // hex string - address
    const collectionId = Address.collection.addressToId(collectionAddress);

    return {
      collectionId
    } as unknown as CreateCollectionParsed;
  }

  async setCollectionProperties(collectionId: number, properties: CollectionProperty[], signer: Signer): Promise<void> {
    const nftFactory = await UniqueNFTFactory(collectionId, signer);

    await (await nftFactory.setCollectionProperties(properties)).wait();
  }

  async setTokenPropertyPermissions(collectionId: number, tokenPropertyPermissions: PropertyKeyPermission[], signer: Signer): Promise<void> {
    const nftFactory = await UniqueNFTFactory(collectionId, signer);

    await(
      await nftFactory.setTokenPropertyPermissions(
        tokenPropertyPermissions.map(({ key, permission }) => ({
          key,
          permissions: Object.entries(permission).map(([name, value]) => ({
            code: TPP_TO_TPP[name],
            value
          }))
        }))
      )
    ).wait();
  }


  async createTokensV1({ tokens, collectionId }: { tokens: CreateTokenPayload[]; collectionId: number }, signer: Signer): Promise<TokenId[] | undefined> {
    if (!tokens.length) {
      throw new Error('UniqueTokenToCreateDto unavailable');
    }

    const collection = await UniqueNFTFactory(collectionId, signer);
    const toCross = Address.extract.ethCrossAccountId(await signer.getAddress());

    const ids = await Promise.all(
      tokens.map(async ({ data }) => {
        let attr: {key: string, value: string}[] = [];
        if (data && data.encodedAttributes) {
          attr = Object.entries(data.encodedAttributes).map(([ key, value ]) => ({
            key: `a.${key}`,
            value: Utf8.stringToHexString(JSON.stringify(value))
          }));
        }
 
        const encodedSchema = [
          {
            key: 'i.c',
            //@ts-ignore
            value: data?.image?.ipfsCid ? Utf8.stringToHexString(data?.image?.ipfsCid) : ''
          },
          ...attr
        ];

        const tokenMintingResult = parseEthersV5TxReceipt(
          await(await collection.mintCross(toCross, encodedSchema)).wait()
        );

        const tokenId = Number(tokenMintingResult.events.Transfer.tokenId) || 1;

        return { collectionId, tokenId };
      })
    );
    return ids;
  }

  async createTokens({ tokens, collectionId }: { tokens: TokenV2ItemForMultipleDto[]; collectionId: number }, signer: Signer): Promise<TokenId[] | undefined> {    
    if (!tokens.length) {
      throw new Error('UniqueTokenToCreateDto unavailable');
    }
    const collection = await UniqueNFTFactory(collectionId, signer);
    const toCross = Address.extract.ethCrossAccountId(await signer.getAddress());

    const ids = await Promise.all(
      tokens.map(async ({image, name, description, attributes, background_color}) => {
        const tokenInfo: IV2Token = {
          schemaName: 'unique',
          schemaVersion: '2.0.0',
          image,
          name,
          description,
          attributes,
          background_color
        };

        const tokenPropertiesForMinting = SchemaToolsV2.encode
          .token(tokenInfo)
          .tokenProperties.map(({ key, valueHex }) => ({
            key,
            value: valueHex
          }));

        const tokenMintingResult = parseEthersV5TxReceipt(
          await(
            await collection.mintCross(toCross, tokenPropertiesForMinting)
          ).wait()
        );

        const tokenId = Number(tokenMintingResult.events.Transfer.tokenId) || 1;
        return { collectionId, tokenId };
      })
    );
    return ids;
  }

  async burn(payload: { collectionId: number, tokenId: number }, signer: Signer): Promise<void> {
    const nftHelper = await UniqueNFTFactory(payload.collectionId, signer);
    await (await nftHelper.burn(payload.tokenId)).wait();
  }

  getSetSponsorshipFee(payload: SetSponsorshipBody, signer: Signer): Promise<string> {
    throw new Error('not implemented');
  }

  setSponsorship(payload: SetSponsorshipBody, signer: Signer): Promise<void> {
    throw new Error('not implemented');
  }

  getSetCollectionLimitsFee(payload: SetCollectionLimitsBody, signer: Signer): Promise<string> {
    throw new Error('not implemented');
  }

  setCollectionLimits(payload: SetCollectionLimitsBody, signer: Signer): Promise<void> {
    throw new Error('not implemented');
  }
}

export default MetamaskAdapter;
