import { CollectionInfoWithSchemaResponse, CollectionProperty, CreateCollectionBody, CreateCollectionParsed, IpfsUploadResponse, LastTokenIdResultDto, PropertyKeyPermission } from '@unique-nft/sdk';
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
    const unsignedTxPayload = await this.uniqueSdk.collections.confirmSponsorship.build({ collectionId, address: account.address });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collections.confirmSponsorship.sign(unsignedTxPayload, { signer: account });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<CollectionInfoWithSchemaResponse | null> {
    return await this.uniqueSdk?.collection.get({ collectionId }) || null;
  }

  async getLastTokenId(collectionId: number): Promise<LastTokenIdResultDto> {
    return await this.uniqueSdk?.collection.lastTokenId({ collectionId }) || null;
  }

  async removeCollectionSponsor(collectionId: number, { account }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!account) throw new Error('Account not provided');
    const unsignedTxPayload = await this.uniqueSdk.collections.removeSponsorship.build({ collectionId, address: account.address });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collections.removeSponsorship.sign(unsignedTxPayload, { signer: account });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async uploadFile(file: Blob): Promise<IpfsUploadResponse | undefined> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');

    const blob = Buffer.from(await file.arrayBuffer());

    return (await this.uniqueSdk.ipfs.uploadFile({ file: blob }));
  }

  async setProperties(collectionId: number, properties: CollectionProperty[], { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.setCollectionProperties(collectionId, properties, account.signer);
  }

  async setTokenPropertyPermissions(collectionId: number, permissions: PropertyKeyPermission[], { account }: TransactionOptions): Promise<void> {
    const adapter = this.getAdapter(account);
    await adapter.setTokenPropertyPermissions(collectionId, permissions, account.signer);
  }

  async createCollection(collectionPayload: CreateCollectionBody, { account }: TransactionOptions): Promise<CreateCollectionParsed | undefined> {
    const adapter = this.getAdapter(account);
    return await adapter.createCollection(collectionPayload, account.signer);
  }

  async getCreateCollectionFee(collectionPayload: CreateCollectionBody, { account }: TransactionOptions): Promise<string> {
    const adapter = this.getAdapter(account);
    return await adapter.getCreateCollectionFee(collectionPayload, account.signer);
  }
}
