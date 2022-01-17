import { IRpcStrategy } from '../../types'
import { AttributesDecoded, MetadataType, NFTCollection, NFTToken } from './types'
import { normalizeAccountId } from '../../utils/normalizeAccountId'
import { deserializeNft, ProtobufAttributeType } from '../../utils/protobufUtils'
import { hex2a } from '../../utils/decoder'
import { ApiPromise } from '@polkadot/api'

class UniqueRPC implements IRpcStrategy<NFTCollection, NFTToken> {
  public api: ApiPromise

  constructor(api: ApiPromise) {
    this.api = api
  }

  private decodeStruct({ attr, data }: { attr?: any; data?: string }): AttributesDecoded {
    if (attr && data) {
      try {
        const schema = JSON.parse(attr) as ProtobufAttributeType

        if (schema?.nested) {
          return deserializeNft(schema, Buffer.from(data.slice(2), 'hex'), 'en')
        }
      } catch (e) {
        console.log('decodeStruct error', e)
      }
    }

    return {}
  }

  private getTokenImageUrl(urlString: string, tokenId: string): string {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId)
    }

    return urlString
  }

  // uses for token image path
  private async fetchTokenImage(
    collectionInfo: Pick<NFTCollection, 'offchainSchema'>,
    tokenId: string
  ): Promise<string> {
    try {
      const collectionMetadata = JSON.parse(hex2a(collectionInfo.offchainSchema)) as MetadataType

      if (collectionMetadata.metadata) {
        const dataUrl = this.getTokenImageUrl(collectionMetadata.metadata, tokenId)
        const urlResponse = await fetch(dataUrl)
        const jsonData = (await urlResponse.json()) as { image: string }

        return jsonData.image
      }
    } catch (e) {
      console.log('image metadata parse error', e)
    }

    return ''
  }

  private getOnChainSchema(collection: NFTCollection): { attributesConst: string; attributesVar: string } {
    if (collection) {
      return {
        attributesConst: hex2a(collection.constOnChainSchema),
        attributesVar: hex2a(collection.variableOnChainSchema),
      }
    }

    return {
      attributesConst: '',
      attributesVar: '',
    }
  }

  public setApi(api: ApiPromise) {
    this.api = api
  }

  public async getCollection(collectionId: string): Promise<NFTCollection | null> {
    if (!this.client?.api) {
      return null
    }
    try {
      const collectionInfo =
        // @ts-ignore
        await this.client.api.rpc.unique.collectionById(collectionId)

      return {
        ...(collectionInfo.toJSON() as unknown as NFTCollection),
        id: collectionId,
      }
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e)
    }

    return null
  }

  public async getToken(collection: NFTCollection, tokenId: string): Promise<NFTToken | null> {
    if (!this.client?.api || !collection) {
      return null
    }

    try {
      const variableData = (
        // @ts-ignore
        await this.client?.api.rpc.unique.variableMetadata(collection.id, tokenId)
      ).toJSON() as string
      const constData: string = (
        // @ts-ignore
        await this.client?.api.rpc.unique.constMetadata(collection.id, tokenId)
      ).toJSON() as string
      const crossAccount = normalizeAccountId(
        // @ts-ignore
        (await this.client?.api.rpc.unique.tokenOwner(collection.id, tokenId)).toJSON() as string
      ) as { Substrate: string }

      let imageUrl = ''

      if (collection.offchainSchema) {
        if (collection.schemaVersion === 'ImageURL') {
          imageUrl = this.getTokenImageUrl(hex2a(collection.offchainSchema), tokenId)
        } else {
          imageUrl = await this.fetchTokenImage(collection, tokenId)
        }
      }

      const onChainSchema = this.getOnChainSchema(collection)

      return {
        id: tokenId,
        constData,
        variableData,
        owner: crossAccount,
        imageUrl,
        attributes: {
          ...this.decodeStruct({ attr: onChainSchema.attributesConst, data: constData }),
          ...this.decodeStruct({ attr: onChainSchema.attributesVar, data: variableData }),
        },
      }
    } catch (e) {
      console.log('getDetailedTokenInfo error', e)

      return null
    }
  }

  public async getTokensOfCollection(collectionId: string, ownerId: string): Promise<NFTToken[]> {
    if (!this.client?.api || !collectionId || !ownerId) {
      return []
    }

    try {
      // @ts-ignore
      return await this.client.api.query.unique.accountTokens(collectionId, { Substrate: ownerId })
    } catch (e) {
      console.log('getTokensOfCollection error', e)
    }

    return []
  }
}

export default UniqueRPC
