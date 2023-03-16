import { Client, CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import UniqueController from './controllers/base/UniqueController';
import { TransactionOptions } from './types';

export class UniqueSDKCollectionController implements UniqueController {
  public uniqueSdk: Client;
  private collectionIds: number[] = [];

  // TODO: proper initialization in Api
  constructor(sdk: Client = new Client({ baseUrl: '' })) {
    this.uniqueSdk = sdk;
  }

  async setNetwork(options: { sdk: Client, collectionIds: number[] }): Promise<void> {
    this.uniqueSdk = options.sdk;
    this.collectionIds = options.collectionIds;
    // just a stub
    return await new Promise(() => {});
  }

  async confirmSponsorship(collectionId: number, { signer }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!signer) return;
    const unsignedTxPayload = await this.uniqueSdk.collections.confirmSponsorship.build({ collectionId, address: signer.getAddress() });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collections.confirmSponsorship.sign(unsignedTxPayload, { signer });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getCollection(collectionId: number): Promise<CollectionInfoWithSchemaResponse | null> {
    return await this.uniqueSdk?.collections.get({ collectionId }) || null;
  }

  async getFeaturedCollections(): Promise<CollectionInfoWithSchemaResponse[]> {
    const collections: Array<CollectionInfoWithSchemaResponse> = [];
    for (let i = 0; i < this.collectionIds.length; i++) {
      const collectionInf = await this.getCollection(this.collectionIds[i]);

      if (collectionInf &&
        collectionInf.owner &&
        collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' &&
        !collections.find((collection) => collection.id === this.collectionIds[i])) {
        collections.push({ ...collectionInf, id: this.collectionIds[i] });
      }
    }
    return collections;
  }

  async removeCollectionSponsor(collectionId: number, { signer }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!signer) return;
    const unsignedTxPayload = await this.uniqueSdk.collections.removeSponsorship.build({ collectionId, address: signer.getAddress() });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collections.removeSponsorship.sign(unsignedTxPayload, { signer });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }
}
