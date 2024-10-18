import { Contract, ethers, JsonRpcSigner, Signer } from 'ethers';
import { IV2Token, SchemaTools as SchemaToolsV2 } from '@unique-nft/schemas-v2';
import { CollectionProperty, CreateCollectionParsed, CreateCollectionV2ArgsDto, TokenV2ItemForMultipleDto, PropertyKeyPermission, SetCollectionLimitsBody, SetSponsorshipBody, TokenId, CreateTokenPayload } from '@unique-nft/sdk';
import { UniqueNFTFactory, UniqueFungibleFactory, UniqueRefungibleTokenFactory, CollectionHelpersFactory, parseEthersV6TxReceipt } from '@unique-nft/solidity-interfaces';
import { EthCrossAccountId, Address } from '@unique-nft/utils';
import { Utf8 } from 'utf-helpers';
import IMarketContractAdapter, { IMarketContractProperties, IPurchaseTokenData, IRemoveFromSell, ITransferFungible } from './IMarketContractAdapter';

import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';
import { CollectionMode, CollectionNestingAndPermissionStruct$1, TPP_TO_TPP, TransferTokenParams } from '../types';
import { sleep } from 'utils/helpers';

const collectionLimitFields = {
  accountTokenOwnershipLimit: 0,
  tokenLimit: 3,
  transfersEnabled: 8
};

type CollectionLimitFieldKey = keyof typeof collectionLimitFields;

const buyGasLimit = 1_000_000;
const sellGasLimit = 200_000;

class MetamaskAdapter implements IMarketContractAdapter {
  private getContract(contract: IMarketContractProperties, signer: Signer) {
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
    const rpcSigner = signer as JsonRpcSigner;
    const from = Address.extract.ethCrossAccountId(addressFrom);
    const to = Address.extract.ethCrossAccountId(addressTo);
    console.log(signer, 'SIGNER', await rpcSigner.getAddress());

    const uniqueFungible = await UniqueFungibleFactory(0, rpcSigner);

    console.log(uniqueFungible, 'UniqueFungible Instance');
    const estimateGas = await uniqueFungible.estimateGas.transferFromCross(
      from, to, amount.raw, { from: addressFrom }
    );

    const feeData = await rpcSigner.provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    // const gasPrice = await uniqueFungible.provider.getGasPrice();
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

  async getSellFee(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, currency: number, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(contractProps, signer);
    const gasPrice = await contract.provider.getGasPrice();
    const estimateGas = await contract.provider.estimateGas({
      from: from.eth,
      gasLimit: sellGasLimit,
      gasPrice
    });
    return estimateGas.mul(gasPrice).toString();
  }

  async sell(from: EthCrossAccountId, collectionId: number, tokenId: number, price: string, currency: number, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<void> {
    const contract = this.getContract(contractProps, signer);
    await this.callContract(contract, 'put', collectionId, tokenId, price, currency, amount, from, { gasLimit: sellGasLimit });
  }

  async getBuyFee(to: EthCrossAccountId, collectionId: number, tokenId: number, price: string, amount: number, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(contractProps, signer);
    const estimateGas = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { value: price, gasLimit: buyGasLimit });
    const gasPrice = await contract.provider.getGasPrice();
    return estimateGas.mul(gasPrice).toString();
  }

  async buy({ to, collectionId, tokenId, price, amount, contract: contractProps, signer }: IPurchaseTokenData): Promise<void> {
    const contract = this.getContract(contractProps, signer);
    const estimateGas = await contract.estimateGas.buy(collectionId, tokenId, amount, to, { value: price, gasLimit: buyGasLimit });
    await this.callContract(contract, 'buy', collectionId, tokenId, amount, to, { value: price, gasLimit: estimateGas.add(1000) });
  }

  async changePrice(collectionId: number, tokenId: number, price: string, currency: number, signer: Signer, contractProps: IMarketContractProperties): Promise<void> {
    const contract = this.getContract(contractProps, signer);

    const estimateGas = await contract.estimateGas.changePrice(collectionId, tokenId, price, currency, { gasLimit: buyGasLimit });
    await this.callContract(contract, 'changePrice', collectionId, tokenId, price, currency, { gasLimit: estimateGas.add(1000) });
  }

  async getChangePriceFee(collectionId: number, tokenId: number, price: string, currency: number, signer: Signer, contractProps: IMarketContractProperties): Promise<string> {
    const contract = this.getContract(contractProps, signer);

    const estimateGas = await contract.estimateGas.changePrice(collectionId, tokenId, price, currency, { value: price, gasLimit: buyGasLimit });
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

    const collectionCreationFee = await collectionHelper.collectionCreationFee();

    const collectionCreationEstimateGas = await collectionHelper.estimateGas.createNFTCollection(
      name,
      description,
      tokenPrefix || name.slice(0, 4),
      {
        from: address,
        value: collectionCreationFee
      }
    );

    const gasPrice = await collectionHelper.provider.getGasPrice();

    const totalFeeBigNumber = collectionCreationEstimateGas.mul(gasPrice).add(collectionCreationFee);
    const totalFeeFormatted = parseFloat(ethers.formatEther(totalFeeBigNumber));

    return String(totalFeeFormatted);
  }

  async createCollection({ name, description, tokenPrefix, address }: CreateCollectionV2ArgsDto, signer: Signer): Promise<CreateCollectionParsed | undefined> {
    const collectionHelpers = await CollectionHelpersFactory(signer);
    const createCollectionResult = 
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
      ).wait();

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

  async setCollectionNesting(collectionId: number, value: CollectionNestingAndPermissionStruct$1, signer: Signer): Promise<void> {
    const collection = await UniqueNFTFactory(collectionId, signer);

    await (await collection.setCollectionNesting(value)).wait();
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
        let attr: { key: string, value: string }[] = [];
        if (data && data.encodedAttributes) {
          attr = Object.entries(data.encodedAttributes).map(([key, value]) => ({
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
        const tx = await(await collection.mintCross(toCross, encodedSchema)).wait()

        if (!tx) return;
        const tokenMintingResult = parseEthersV6TxReceipt(tx);

        const tokenId = Number(tokenMintingResult.events.Transfer.tokenId) || 1;

        return { collectionId, tokenId };
      })
    );
    return ids;
  }

  async createTokens(
    { tokens, collectionId }: { tokens: TokenV2ItemForMultipleDto[]; collectionId: number },
    signer: Signer
  ): Promise<TokenId[] | undefined> {
    if (!tokens.length) {
      throw new Error('UniqueTokenToCreateDto unavailable');
    }
  
    const collection = await UniqueNFTFactory(collectionId, signer);
    const addr = await signer.getAddress();
    const toCross = Address.extract.ethCrossAccountId(addr);

    const mintDataArray = tokens.map((tokenData) => {
      try {
        const {
          image,
          name,
          description,
          attributes,
          background_color,
          royalties,
          media,
          external_url,
        } = tokenData;

        const tokenInfo: IV2Token = {
          schemaName: 'unique',
          schemaVersion: '2.0.0',
          image,
          name,
          description,
          attributes,
          media,
          external_url,
          royalties: royalties?.map(({ address, percent }) => ({
            address,
            percent: percent || 0,
          })),
          background_color,
        };

        const encodedToken = SchemaToolsV2.encode.token(tokenInfo);
        const tokenPropertiesForMinting = encodedToken.tokenProperties.map(({ key, valueHex }) => ({
          key,
          value: valueHex,
        }));

        const owner = toCross;

        return {
          owner,
          properties: tokenPropertiesForMinting,
        };
      } catch (tokenError) {
        console.error('Error preparing token data:', tokenData, tokenError);
        return null;
      }
    });

    const filteredMintDataArray = mintDataArray.filter((data) => data !== null) as MintTokenDataStruct$1[];

    if (!filteredMintDataArray.length) {
      throw new Error('No valid tokens to mint.');
    }

    console.log(filteredMintDataArray, 'filteredMintDataArray');
    // const mintTx = await (
    //   await collection.mintBulkCross(filteredMintDataArray)
    // ).wait();
    const tx = await (
      await collection.mintBulkCross(filteredMintDataArray)
    ).wait();

    if (!tx) return;

    const tokenMintingResult = parseEthersV6TxReceipt(tx);

    console.log(tokenMintingResult, 'mintTx');
    //@ts-ignore
    return tokenMintingResult;
  }

  async burn(payload: { collectionId: number, tokenId: number }, signer: Signer): Promise<void> {
    const nftHelper = await UniqueNFTFactory(payload.collectionId, signer);
    await (await nftHelper.burn(payload.tokenId)).wait();
  }

  async getSetSponsorshipFee(payload: SetSponsorshipBody, signer: Signer): Promise<string> {
    const rpcSigner = signer as JsonRpcSigner;
    const collection = await UniqueNFTFactory(payload.collectionId, rpcSigner);
    const estimateGas: bigint = await collection.estimateGas.setCollectionSponsorCross({
      sub: '0x0',
      eth: payload.address,
    });

    const feeData = await rpcSigner.provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) {
      throw new Error('Gas price could not be retrieved');
    }

    const totalFeeBigInt: bigint = estimateGas * gasPrice;

    const totalFeeFormatted = ethers.formatEther(totalFeeBigInt);
    
    return totalFeeFormatted;
  }

  async setSponsorship(payload: SetSponsorshipBody, signer: Signer): Promise<void> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);
    const tx = await collection.setCollectionSponsorCross({
      sub: '0x0',
      eth: payload.address
    });
    await tx.wait();
  }

  async confirmCollectionSponsorship(payload: SetSponsorshipBody, signer: Signer): Promise<void> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);
    
    const tx = await collection.confirmCollectionSponsorship({
      from: await signer.getAddress(),
    });
    
    await tx.wait();
  }

  async getConfirmSponsorshipFee(payload: SetSponsorshipBody, signer: Signer): Promise<string> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);
    
    const estimateGas = await collection.estimateGas.confirmCollectionSponsorship({
      from: await signer.getAddress(),
    });
  
    if (!signer.provider) return '';
    
    const gasPrice = await signer.provider.getGasPrice();
    const totalFeeBigNumber = estimateGas.mul(gasPrice);
    const totalFeeFormatted = parseFloat(ethers.formatEther(totalFeeBigNumber));
  
    return String(totalFeeFormatted);
  }
  
  async getSetCollectionLimitsFee(payload: SetCollectionLimitsBody, signer: Signer): Promise<string> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);
    let totalGasEstimate = 0n;
    
    for (const [fieldKey, value] of Object.entries(payload.limits)) {
      const typedFieldKey = fieldKey as CollectionLimitFieldKey;
      const field = collectionLimitFields[typedFieldKey];
      
      if (field === undefined) {
        console.log(`Invalid field: ${fieldKey}`);
        continue;
      }
  
      const limitStruct = {
        field,
        value: {
          status: value !== null,
          value: value !== null ? ethers.toBigInt(value) : 0n,
        },
      };
  
      const estimateGas = await collection.estimateGas.setCollectionLimit(limitStruct);
      totalGasEstimate += estimateGas;
    }
  
    if (!signer.provider) return '';
  
    const gasPrice = await signer.provider.getGasPrice();
  
    const totalFeeBigInt = totalGasEstimate * gasPrice;
    const totalFeeFormatted = parseFloat(ethers.formatEther(totalFeeBigInt));
  
    return String(totalFeeFormatted);
  }
  
  async setCollectionLimits(payload: SetCollectionLimitsBody, signer: Signer): Promise<void> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);
  
    for (const [fieldKey, value] of Object.entries(payload.limits)) {
      const typedFieldKey = fieldKey as CollectionLimitFieldKey;
      const field = collectionLimitFields[typedFieldKey];
  
      if (field === undefined) {
        console.log(`Invalid field: ${fieldKey}`);
        continue;
      }
      const limitStruct = {
        field,
        value: {
          status: value !== null,
          value: value !== null ? BigNumber.from(value) : BigNumber.from(0),
        },
      };
  
      await (await collection.setCollectionLimit(limitStruct)).wait();
    }
  }

  async burnCollection(collectionId: number, signer: Signer): Promise<void> {
    const collectionHelper = await CollectionHelpersFactory(signer);
    const collectionAddress = Address.collection.idToAddress(collectionId);

    await (await collectionHelper.destroyCollection(collectionAddress)).wait();
  }

  async getBurnCollectionFee(collectionId: number, signer: Signer): Promise<string> {
    const collectionHelper = await CollectionHelpersFactory(signer);
    const collectionAddress = Address.collection.idToAddress(collectionId);

    const collectionBurnFee = await collectionHelper.estimateGas.destroyCollection(collectionAddress);
    const gasPrice = await collectionHelper.provider.getGasPrice();

    return ethers.formatEther(collectionBurnFee.mul(gasPrice));
  }

  async transferBalanceFungible({ collectionId, address, recipient, amount, decimals, signer }: ITransferFungible): Promise<any> {
    if (!signer) {
      throw new Error("Signer is required");
    }
    
    const amountWithDecimals = ethers.parseUnits(
      amount.toString(),
      decimals
    );
    const fromCross = Address.extract.ethCrossAccountId(address);
    const toCross = Address.extract.ethCrossAccountId(recipient);
    const uniqueFungible = await UniqueFungibleFactory(collectionId, signer);
    return await uniqueFungible.transferFromCross(fromCross, toCross, amountWithDecimals);
  }

  async getTransferBalanceFungibleFee({ collectionId, address, recipient, amount, signer }: ITransferFungible): Promise<string> {
    if (!signer) {
      throw new Error("Signer is required");
    }

    const fromCross = Address.extract.ethCrossAccountId(address);
    const toCross = Address.extract.ethCrossAccountId(recipient);
    const uniqueFungible = await UniqueFungibleFactory(collectionId, signer);

    const uniqueFungibleTransferFee =
      await uniqueFungible.estimateGas.transferFromCross(
        fromCross,
        toCross,
        amount
      );
    const gasPrice = await uniqueFungible.provider.getGasPrice();

    return ethers.formatEther(uniqueFungibleTransferFee.mul(gasPrice));
  }

  async allowanceFungible({ collectionId, recipient, amount, signer }: ITransferFungible): Promise<any> {
    if (!signer) {
      throw new Error("Signer is required");
    }
    const toCross = Address.extract.ethCrossAccountId(recipient);
    const uniqueFungible = await UniqueFungibleFactory(collectionId, signer);

    return await uniqueFungible.approveCross(toCross, amount);
  }

  async revokeTokenSell({ collectionId, tokenId, contract: contractOption, signer }: IRemoveFromSell) {
    if (!signer) {
      throw new Error("Signer is required");
    }
    const contract = this.getContract(contractOption, signer);
    await this.callContract(contract, 'revoke', collectionId, tokenId, {
      gasLimit: sellGasLimit
    });
  }
}

export default MetamaskAdapter;
