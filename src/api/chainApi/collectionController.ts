import { CollectionProperty, CollectionWithInfoV2Dto, CreateCollectionParsed, CreateCollectionV2ArgsDto, IpfsUploadResponse, LastTokenIdResultDto, PropertyKeyPermission, SetCollectionLimitsBody, SetSponsorshipBody } from '@unique-nft/sdk';
import { AllowedCollections } from 'api/restApi/settings/types';
import { NetworkOptions } from 'api/sdk/sdkClient';
import BaseController from './controllers/BaseController';
import { TransactionOptions } from './types';
import { Blob as BufferBlob, Buffer } from 'buffer';

export class UniqueSDKCollectionController extends BaseController {
  private allowedCollections: AllowedCollections;
  constructor(options: NetworkOptions) {
    super(options);
    this.allowedCollections = options.settings.blockchain.unique.collections;
  }

  setNetwork(options: NetworkOptions): void {
    super.setNetwork(options);
    this.allowedCollections = options.settings.blockchain.unique.collections;
  }

  async confirmSponsorship(collectionId: number, { account }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!account) throw new Error('Account not provided');
    const unsignedTxPayload = await this.uniqueSdk.collection.confirmSponsorship.build({
      collectionId,
      address: account.address
    });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collection.confirmSponsorship.sign(unsignedTxPayload, { signer: account });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<CollectionWithInfoV2Dto | null> {
    return await this.uniqueSdk?.collection.getV2({ collectionId }) || null;
  }

  async getLastTokenId(collectionId: number): Promise<LastTokenIdResultDto> {
    return await this.uniqueSdk?.collection.lastTokenId({ collectionId }) || null;
  }

  async removeCollectionSponsor(collectionId: number, { account }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!account) throw new Error('Account not provided');
    await this.uniqueSdk.collection.removeSponsorship.submitWaitResult({ collectionId, address: account.address }, { signer: account });
  }

  async uploadFile(file: Blob): Promise<IpfsUploadResponse | undefined> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');

    return (await this.uniqueSdk.ipfs.uploadFile({ file: file as BufferBlob }));
  }

  async setProperties(collectionId: number, properties: CollectionProperty[], { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.setCollectionProperties(collectionId, properties, account.signer);
  }

  async setTokenPropertyPermissions(collectionId: number, permissions: PropertyKeyPermission[], { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.setTokenPropertyPermissions(collectionId, permissions, account.signer);
  }

  async createCollection(collectionPayload: CreateCollectionV2ArgsDto, { account }: TransactionOptions): Promise<CreateCollectionParsed | undefined> {
    const adapter = this.getAdapter(account);
    return await adapter.createCollection(collectionPayload, account.signer);
  }

  async getCreateCollectionFee(collectionPayload: CreateCollectionV2ArgsDto, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    return await adapter.getCreateCollectionFee(collectionPayload, account.signer);
  }

  async getSetSponsorshipFee(payload: SetSponsorshipBody, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    return await adapter.getSetSponsorshipFee(payload, account.signer);
  }

  async setSponsorship(payload: SetSponsorshipBody, { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.setSponsorship(payload, account.signer);
  }

  async getSetCollectionLimitsFee(payload: SetCollectionLimitsBody, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    return await adapter.getSetCollectionLimitsFee(payload, account.signer);
  }

  async setCollectionLimits(payload: SetCollectionLimitsBody, { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.setCollectionLimits(payload, account.signer);
  }

  async getRemoveCollectionSponsorFee(collectionId: number, { account }: TransactionOptions): Promise<string> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    return (await this.uniqueSdk.collection.removeSponsorship.getFee({ collectionId, address: account.address })).fee.formatted;
  }

  async getConfirmCollectionSponsorFee(collectionId: number, { account }: TransactionOptions): Promise<string> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    return (await this.uniqueSdk.collection.confirmSponsorship.getFee({ collectionId, address: account.address })).fee.formatted;
  }

  async burn(collectionId: number, { account }: TransactionOptions): Promise<void> {
    await this.getAdapter(account).burnCollection(collectionId, account.signer);
  }

  async getBurnFee(collectionId: number, { account }: TransactionOptions): Promise<string> {
    return await this.getAdapter(account).getBurnCollectionFee(collectionId, account.signer);
  }
}
