import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { AllowedCollections } from 'api/restApi/settings/types';
import { NetworkOptions } from 'api/sdk/sdkClient';
import BaseController from './controllers/BaseController';
import { TransactionOptions } from './types';

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
    const { signature } = await this.uniqueSdk.collections.confirmSponsorship.sign(unsignedTxPayload, { signer: account.account });
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
    for (const id in this.allowedCollections) {
      const collectionId = Number(id);
      const collectionInf = await this.getCollection(collectionId);

      if (collectionInf &&
        collectionInf.owner &&
        collectionInf.owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' &&
        !collections.find((collection) => collection.id === collectionId)) {
        collections.push({ ...collectionInf, id: collectionId });
      }
    }
    return collections;
  }

  async removeCollectionSponsor(collectionId: number, { account }: TransactionOptions): Promise<void> {
    if (!this.uniqueSdk) throw new Error('Controller isn\'t ready');
    if (!account) throw new Error('Account not provided');
    const unsignedTxPayload = await this.uniqueSdk.collections.removeSponsorship.build({ collectionId, address: account.address });
    if (!unsignedTxPayload) throw new Error('Transaction build error');
    const { signature } = await this.uniqueSdk.collections.removeSponsorship.sign(unsignedTxPayload, { signer: account.account });
    if (!signature) throw new Error('Signing failed');
    await this.uniqueSdk.extrinsics.submit({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }
}
