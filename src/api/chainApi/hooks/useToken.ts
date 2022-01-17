import { useCallback } from 'react'
import { useApi } from '../../../hooks/useApi'
import { NftCollectionInterface } from './useCollection'
import { normalizeAccountId } from '../utils/normalizeAccountId'


export interface TokenDetailsInterface {
  owner?: { Substrate: string }
  constData?: string
  variableData?: string
}

interface UseTokenInterface {
  getDetailedReFungibleTokenInfo: (
    collectionId: string,
    tokenId: string
  ) => Promise<TokenDetailsInterface>
  getDetailedTokenInfo: (collectionId: string, tokenId: string) => Promise<TokenDetailsInterface>
  getTokenInfo: (
    collectionInfo: NftCollectionInterface,
    tokenId: string
  ) => Promise<TokenDetailsInterface>
}

export function useToken(): UseTokenInterface {
  const { rpcApi } = useApi()

  const getDetailedTokenInfo = useCallback(
    async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
      if (!rpcApi) {
        return {}
      }

      try {
        let tokenDetailsData: TokenDetailsInterface = {}

        const variableData = // @ts-ignore
        (await rpcApi.rpc.unique.variableMetadata(collectionId, tokenId)).toJSON() as string
        const constData: string = // @ts-ignore
        (await rpcApi.rpc.unique.constMetadata(collectionId, tokenId)).toJSON() as string
        const crossAccount = normalizeAccountId(
          // @ts-ignore
          (await rpcApi.rpc.unique.tokenOwner(collectionId, tokenId)).toJSON() as string
        ) as { Substrate: string }

        tokenDetailsData = {
          constData,
          owner: crossAccount,
          variableData,
        }

        return tokenDetailsData
      } catch (e) {
        console.log('getDetailedTokenInfo error', e)

        return {}
      }
    },
    [rpcApi]
  )

  const getDetailedReFungibleTokenInfo = useCallback(
    async (collectionId: string, tokenId: string): Promise<TokenDetailsInterface> => {
      if (!rpcApi) {
        return {}
      }

      try {
        // @ts-ignore
        return (await rpcApi.rpc.unique.reFungibleItemList(
          collectionId,
          tokenId
        )) as unknown as TokenDetailsInterface
      } catch (e) {
        console.log('getDetailedReFungibleTokenInfo error', e)

        return {}
      }
    },
    [rpcApi]
  )

  const getTokenInfo = useCallback(
    async (
      collectionInfo: NftCollectionInterface,
      tokenId: string
    ): Promise<TokenDetailsInterface> => {
      let tokenDetailsData: TokenDetailsInterface = {}

      if (tokenId && collectionInfo) {
        if (Object.prototype.hasOwnProperty.call(collectionInfo.mode, 'nft')) {
          tokenDetailsData = await getDetailedTokenInfo(collectionInfo.id, tokenId)
        } else if (Object.prototype.hasOwnProperty.call(collectionInfo.mode, 'reFungible')) {
          tokenDetailsData = await getDetailedReFungibleTokenInfo(collectionInfo.id, tokenId)
        }
      }

      return tokenDetailsData
    },
    [getDetailedTokenInfo, getDetailedReFungibleTokenInfo]
  )

  return {
    getDetailedReFungibleTokenInfo,
    getDetailedTokenInfo,
    getTokenInfo,
  }
}
