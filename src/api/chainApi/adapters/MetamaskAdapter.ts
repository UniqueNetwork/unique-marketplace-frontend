import { Contract, ethers, JsonRpcSigner, Signer } from 'ethers';

import { IV2Token, SchemaTools as SchemaToolsV2 } from '@unique-nft/schemas-v2';
import { CollectionProperty, CreateCollectionParsed, CreateCollectionV2ArgsDto, TokenV2ItemForMultipleDto, PropertyKeyPermission, SetCollectionLimitsBody, SetSponsorshipBody, TokenId, CreateTokenPayload } from '@unique-nft/sdk';
import { UniqueNFTFactory, UniqueFungibleFactory, UniqueRefungibleTokenFactory, CollectionHelpersFactory, parseEthersV6TxReceipt } from '@unique-nft/solidity-interfaces';
import { EthCrossAccountId, Address } from '@unique-nft/utils';
import { Utf8 } from 'utf-helpers';
import IMarketContractAdapter, { IMarketContractProperties, IPurchaseTokenData, IRemoveFromSell, ITransferFungible, TokenForOrder } from './IMarketContractAdapter';
import marketplaceAbi from '../contracts/marketplace-0.json';
import { NestTokenParam } from './IBaseAdapter';
import { ChainValue } from '../controllers/BaseController';
import {
  CollectionMode,
  CollectionNestingAndPermissionStruct$1,
  TPP_TO_TPP,
  TransferTokenParams,
} from '../types';
import { sleep } from 'utils/helpers';

const collectionLimitFields = {
  accountTokenOwnershipLimit: 0,
  tokenLimit: 3,
  transfersEnabled: 8,
  ownerCanTransfer: 6,
};

type CollectionLimitFieldKey = keyof typeof collectionLimitFields;

const buyGasLimit = 1_000_000n;
const sellGasLimit = 200_000n;
const sellBatchGasLimit = 5_000_000n;

class MetamaskAdapter implements IMarketContractAdapter {
  private getContract(contract: IMarketContractProperties, signer: Signer) {
    return new ethers.Contract(
      contract.address,
      (contract.abi as ethers.InterfaceAbi) || marketplaceAbi,
      signer
    );
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

  async getTransferTokenFee(
    from: string,
    to: string,
    collectionId: number,
    tokenId: number,
    mode: CollectionMode,
    amount: number,
    signer: Signer
  ): Promise<string> {
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId, tokenId }, signer)
      : UniqueNFTFactory(collectionId, signer));

    const estimateGas = await tokenHelper.transferFromCross.estimateGas(
      fromCross,
      toCross,
      mode === 'ReFungible' ? amount : tokenId
    );
    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '0';

    const totalFeeFormatted = String(estimateGas * gasPrice);

    return totalFeeFormatted;
  }

  async transferToken(
    from: string,
    to: string,
    collectionId: number,
    tokenId: number,
    mode: CollectionMode,
    amount: number,
    signer: Signer
  ): Promise<void> {
    const fromCross = Address.extract.ethCrossAccountId(from);
    const toCross = Address.extract.ethCrossAccountId(to);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId, tokenId }, signer)
      : UniqueNFTFactory(collectionId, signer));

    await (await tokenHelper.transferFromCross(fromCross, toCross, mode === 'ReFungible' ? amount : tokenId)).wait();
  }

  async getNestTokenFee(
    address: string,
    nested: NestTokenParam,
    parent: NestTokenParam,
    mode: CollectionMode,
    amount: number,
    signer: Signer
  ): Promise<string> {
    const newParentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: nested.collectionId, tokenId: nested.tokenId }, signer)
      : UniqueNFTFactory(nested.collectionId, signer));

    const estimateGas = await tokenHelper.transferFrom.estimateGas(
      address,
      newParentTokenAddress,
      mode === 'ReFungible' ? amount : nested.tokenId
    );
    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '0';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async nestToken(
    address: string,
    nested: NestTokenParam,
    parent: NestTokenParam,
    mode: CollectionMode,
    amount: number,
    signer: Signer
  ): Promise<void> {
    const newParentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: nested.collectionId, tokenId: nested.tokenId }, signer)
      : UniqueNFTFactory(nested.collectionId, signer));

    await (
      await tokenHelper.transferFrom(address, newParentTokenAddress, mode === 'ReFungible' ? amount : nested.tokenId)
    ).wait();
  }

  async getUnnestTokenFee(
    target: NestTokenParam,
    parent: NestTokenParam,
    mode: CollectionMode,
    amount: number,
    signer: Signer
  ): Promise<string> {
    const parentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);
    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: target.collectionId, tokenId: target.tokenId }, signer)
      : UniqueNFTFactory(target.collectionId, signer));

    const ownerAddress = await signer.getAddress();

    const estimateGas = await tokenHelper.transferFrom.estimateGas(
      parentTokenAddress,
      ownerAddress,
      mode === 'ReFungible' ? amount : target.tokenId
    );
    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '0';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async unnestToken(
    target: NestTokenParam,
    parent: NestTokenParam,
    mode: CollectionMode,
    amount: number,
    signer: Signer
  ): Promise<void> {
    const parentTokenAddress = Address.nesting.idsToAddress(parent.collectionId, parent.tokenId);

    const tokenHelper = await (mode === 'ReFungible'
      ? UniqueRefungibleTokenFactory({ collectionId: target.collectionId, tokenId: target.tokenId }, signer)
      : UniqueNFTFactory(target.collectionId, signer));

    const ownerAddress = await signer.getAddress();
    await (
      await tokenHelper.transferFrom(
        parentTokenAddress,
        ownerAddress,
        mode === 'ReFungible' ? amount : target.tokenId
      )
    ).wait();
  }

  async getTransferBalanceFee(
    addressFrom: string,
    addressTo: string,
    amount: ChainValue,
    signer: Signer
  ): Promise<string> {
    const from = Address.extract.ethCrossAccountId(addressFrom);
    const to = Address.extract.ethCrossAccountId(addressTo);

    const uniqueFungible = await UniqueFungibleFactory(0, signer);

    const estimateGas = await uniqueFungible.transferFromCross.estimateGas(from, to, amount.raw);

    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '0';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async transferBalance(
    addressFrom: string,
    addressTo: string,
    amount: ChainValue,
    signer: Signer
  ): Promise<void> {
    const from = Address.extract.ethCrossAccountId(addressFrom);
    const to = Address.extract.ethCrossAccountId(addressTo);
    const uniqueFungible = await UniqueFungibleFactory(0, signer);
    await (await uniqueFungible.transferFromCross(from, to, amount.raw)).wait();
  }

  async changeAllowance(
    from: string,
    to: string,
    collectionId: number,
    tokenId: number,
    targetAllowance: boolean,
    signer: Signer
  ): Promise<void> {
    const targetTo = targetAllowance ? to : from;
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    await (await nftFactory.approve(targetTo, tokenId)).wait();
  }

  async estimateGasChangeAllowance(
    from: string,
    to: string,
    collectionId: number,
    tokenId: number,
    targetAllowance: boolean,
    signer: Signer
  ): Promise<string> {
    if (!signer || !signer.provider) throw Error('No signer provided');
    const targetTo = targetAllowance ? to : from;
    const nftFactory = await UniqueNFTFactory(collectionId, signer);
    const estimateGas = await nftFactory.approve.estimateGas(targetTo, tokenId);
    const feeData = await signer.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? BigInt(feeData.gasPrice.toString()) : BigInt(0);

    if (!gasPrice) throw Error('Gas price not calculated');

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async sell(
    from: EthCrossAccountId,
    collectionId: number,
    tokenId: number,
    price: string,
    currency: number,
    amount: number,
    signer: Signer,
    contractProps: IMarketContractProperties
  ): Promise<void> {
    const contract = this.getContract(contractProps, signer);
    const putMethod = contract.getFunction('put');
    
    const rest = await (await putMethod({
        collectionId,
        tokenId,
        price,
        currency,
        amount,
        seller: from,
      },
      { gasLimit: sellGasLimit }
    )).wait();
  }
  async sellBatch(
    tokens: TokenForOrder[],
    signer: Signer,
    contractProps: IMarketContractProperties
  ): Promise<void> {
    const contract = this.getContract(contractProps, signer);
    const putBatchMethod = contract.getFunction('putBatch');

    await (await putBatchMethod(
      tokens,
      { gasLimit: sellBatchGasLimit }
    )).wait();
  }
  
  async getBuyFee(
    to: EthCrossAccountId,
    collectionId: number,
    tokenId: number,
    price: string,
    amount: number,
    signer: Signer,
    contractProps: IMarketContractProperties
  ): Promise<string> {
    if (!signer || !signer.provider) throw Error('No signer provided');
    const contract = this.getContract(contractProps, signer);

    const estimateGas = await contract.buy.estimateGas(
      collectionId,
      tokenId,
      amount,
      to,
      { value: price, gasLimit: buyGasLimit }
    );

    const feeData = await signer.provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '0';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async buy({
    to,
    collectionId,
    tokenId,
    price,
    amount,
    contract: contractProps,
    signer,
  }: IPurchaseTokenData): Promise<void> {
    const contract = this.getContract(contractProps, signer);
    const buyMethod = contract.getFunction('buy');
    
    const estimateGas = await buyMethod.estimateGas(collectionId, tokenId, amount, to, {
      value: price,
      gasLimit: buyGasLimit,
    });
    
    await (await buyMethod(collectionId, tokenId, amount, to, {
      value: price,
      gasLimit: estimateGas + 1000n,
    })).wait();
  }

  async changePrice(
    collectionId: number,
    tokenId: number,
    price: string,
    currency: number,
    signer: Signer,
    contractProps: IMarketContractProperties
  ): Promise<void> {
    const contract = this.getContract(contractProps, signer);
    const changePriceMethod = contract.getFunction('changePrice');
    
    const estimateGas = await changePriceMethod.estimateGas(collectionId, tokenId, price, currency, {
      gasLimit: buyGasLimit,
    });
  
    await (await changePriceMethod(collectionId, tokenId, price, currency, {
      gasLimit: estimateGas + 1000n,
    })).wait();
  }

  async transferTokensBatch(
    transfers: TransferTokenParams[],
    signer: Signer,
    onSubmittedOne?: (token: TokenId, index: number) => void
  ): Promise<void> {
    await Promise.all(
      transfers.map(async ({ token, from, to, mode, amount }, index) => {
        const { collectionId, tokenId } = token;
        const fromCross = Address.extract.ethCrossAccountId(from);
        const toCross = Address.extract.ethCrossAccountId(to);
        await sleep(100);
        const tokenHelper = await (mode === 'ReFungible'
          ? UniqueRefungibleTokenFactory({ collectionId, tokenId }, signer)
          : UniqueNFTFactory(collectionId, signer));
        await (
          await tokenHelper.transferFromCross(fromCross, toCross, mode === 'ReFungible' ? amount : tokenId)
        ).wait();
        onSubmittedOne?.(token, index);
      })
    );
  }

  async getCreateCollectionFee(
    { address, tokenPrefix, description, name }: CreateCollectionV2ArgsDto,
    signer: Signer
  ): Promise<string> {
    if (!signer || !signer.provider) throw Error('No signer provided');

    const collectionHelper = await CollectionHelpersFactory(signer);
    const collectionCreationFee = await collectionHelper.collectionCreationFee();

    const collectionCreationEstimateGas = await collectionHelper.createNFTCollection.estimateGas(
      name,
      description,
      tokenPrefix || name.slice(0, 4),
      {
        value: collectionCreationFee,
      }
    );

    const feeData = await signer.provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '0';

    const totalFeeBigNumber = collectionCreationEstimateGas * gasPrice + collectionCreationFee;

    return String(totalFeeBigNumber);
  }

  async createCollection(
    { name, description, tokenPrefix, address }: CreateCollectionV2ArgsDto,
    signer: Signer
  ): Promise<CreateCollectionParsed | undefined> {
    const collectionHelpers = await CollectionHelpersFactory(signer);
    const createCollectionResult = await (
      await collectionHelpers.createNFTCollection(name, description, tokenPrefix || name.slice(0, 4), {
        from: address,
        value: await collectionHelpers.collectionCreationFee(),
      })
    ).wait();

    const collectionAddress = createCollectionResult.events.CollectionCreated.collectionId; // hex string - address
    const collectionId = Address.collection.addressToId(collectionAddress);

    return {
      collectionId,
    } as unknown as CreateCollectionParsed;
  }

  async setCollectionProperties(
    collectionId: number,
    properties: CollectionProperty[],
    signer: Signer
  ): Promise<void> {
    const nftFactory = await UniqueNFTFactory(collectionId, signer);

    await (await nftFactory.setCollectionProperties(properties)).wait();
  }

  async setCollectionNesting(
    collectionId: number,
    value: CollectionNestingAndPermissionStruct$1,
    signer: Signer
  ): Promise<void> {
    const collection = await UniqueNFTFactory(collectionId, signer);

    await (await collection.setCollectionNesting(value)).wait();
  }

  async setTokenPropertyPermissions(
    collectionId: number,
    tokenPropertyPermissions: PropertyKeyPermission[],
    signer: Signer
  ): Promise<void> {
    const nftFactory = await UniqueNFTFactory(collectionId, signer);

    await (
      await nftFactory.setTokenPropertyPermissions(
        tokenPropertyPermissions.map(({ key, permission }) => ({
          key,
          permissions: Object.entries(permission).map(([name, value]) => ({
            code: TPP_TO_TPP[name],
            value,
          })),
        }))
      )
    ).wait();
  }

  async createTokensV1(
    { tokens, collectionId }: { tokens: CreateTokenPayload[]; collectionId: number },
    signer: Signer
  ): Promise<TokenId[] | undefined> {
    if (!tokens.length) {
      throw new Error('UniqueTokenToCreateDto unavailable');
    }

    const collection = await UniqueNFTFactory(collectionId, signer);
    const toCross = Address.extract.ethCrossAccountId(await signer.getAddress());

    const ids = await Promise.all(
      tokens.map(async ({ data }) => {
        let attr: { key: string; value: string }[] = [];
        if (data && data.encodedAttributes) {
          attr = Object.entries(data.encodedAttributes).map(([key, value]) => ({
            key: `a.${key}`,
            value: Utf8.stringToHexString(JSON.stringify(value)),
          }));
        }

        const encodedSchema = [
          {
            key: 'i.c',
            value: data?.image?.ipfsCid ? Utf8.stringToHexString(data?.image?.ipfsCid) : '',
          },
          ...attr,
        ];
        const tx = await (await collection.mintCross(toCross, encodedSchema)).wait();

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

    const tx = await (await collection.mintBulkCross(filteredMintDataArray)).wait();

    if (!tx) return;

    const tokenMintingResult = parseEthersV6TxReceipt(tx);
    const tokenId = Number(tokenMintingResult.events.Transfer.tokenId) || 1;
    return [{ collectionId, tokenId }];
  }

  async burn(payload: { collectionId: number; tokenId: number }, signer: Signer): Promise<void> {
    const nftHelper = await UniqueNFTFactory(payload.collectionId, signer);
    await (await nftHelper.burn(payload.tokenId)).wait();
  }

  async getSetSponsorshipFee(payload: SetSponsorshipBody, signer: Signer): Promise<string> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);

    const estimateGas = await collection.setCollectionSponsorCross.estimateGas({
      sub: '0x0',
      eth: payload.address,
    });

    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) {
      throw new Error('Gas price could not be retrieved');
    }

    const totalFeeBigInt = estimateGas * gasPrice;

    return ethers.formatEther(totalFeeBigInt);
  }

  async setSponsorship(payload: SetSponsorshipBody, signer: Signer): Promise<void> {
    const collection = await UniqueNFTFactory(payload.collectionId, signer);
    const tx = await collection.setCollectionSponsorCross({
      sub: '0x0',
      eth: payload.address,
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

    const estimateGas = await collection.confirmCollectionSponsorship.estimateGas({
      from: await signer.getAddress(),
    });

    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
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

      const estimateGas = await collection.setCollectionLimit.estimateGas(limitStruct);
      totalGasEstimate += estimateGas;
    }

    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '';

    const totalFeeBigInt = totalGasEstimate * gasPrice;

    return String(totalFeeBigInt);
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
  
      let limitValue: { status: boolean; value: any };
  
      if (fieldKey === 'ownerCanTransfer' || fieldKey === 'transfersEnabled') {
        limitValue = {
          status: value !== null,
          value: Number(value),
        };
      } else {
        limitValue = {
          status: value !== null,
          value: value !== null ? ethers.toBigInt(value) : 0n,
        };
      }
  
      const limitStruct = {
        field,
        value: limitValue,
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

    const estimateGas = await collectionHelper.destroyCollection.estimateGas(collectionAddress);

    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async transferBalanceFungible({
    collectionId,
    address,
    recipient,
    amount,
    decimals,
    signer,
  }: ITransferFungible): Promise<any> {
    if (!signer) {
      throw new Error('Signer is required');
    }

    const amountWithDecimals = ethers.parseUnits(amount.toString(), decimals);
    const fromCross = Address.extract.ethCrossAccountId(address);
    const toCross = Address.extract.ethCrossAccountId(recipient);
    const uniqueFungible = await UniqueFungibleFactory(collectionId, signer);
    return await uniqueFungible.transferFromCross(fromCross, toCross, amountWithDecimals);
  }

  async getTransferBalanceFungibleFee({
    collectionId,
    address,
    recipient,
    amount,
    signer,
  }: ITransferFungible): Promise<string> {
    if (!signer) {
      throw new Error('Signer is required');
    }

    const fromCross = Address.extract.ethCrossAccountId(address);
    const toCross = Address.extract.ethCrossAccountId(recipient);
    const uniqueFungible = await UniqueFungibleFactory(collectionId, signer);

    const estimateGas = await uniqueFungible.transferFromCross.estimateGas(fromCross, toCross, amount);
    const feeData = await signer.provider!.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) return '';

    const totalFeeBigInt = estimateGas * gasPrice;

    return String(totalFeeBigInt);
  }

  async allowanceFungible({ collectionId, recipient, amount, signer }: ITransferFungible): Promise<any> {
    if (!signer) {
      throw new Error('Signer is required');
    }
    const toCross = Address.extract.ethCrossAccountId(recipient);
    const uniqueFungible = await UniqueFungibleFactory(collectionId, signer);

    return await uniqueFungible.approveCross(toCross, amount);
  }

  async revokeTokenSell({
    collectionId,
    tokenId,
    contract: contractOption,
    signer,
  }: IRemoveFromSell): Promise<void> {
    const contract = this.getContract(contractOption, signer);
    const revokeMethod = contract.getFunction('revoke');
    
    await (await revokeMethod(collectionId, tokenId, {
      gasLimit: sellGasLimit,
    })).wait();
  }
}

export default MetamaskAdapter;
