// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js'
import { useCallback, useContext } from 'react'
import { useApi } from '../../../hooks/useApi'
import { hex2a } from '../utils/decoder'
import { ProtobufAttributeType } from '../utils/protobufUtils'

export type SchemaVersionTypes = 'ImageURL' | 'Unique'

export interface NftCollectionInterface {
  access?: 'Normal' | 'WhiteList'
  id: string
  decimalPoints: BN | number
  description: number[]
  tokenPrefix: string
  mintMode?: boolean
  mode: {
    nft: null
    fungible: null
    reFungible: null
    invalid: null
  }
  name: number[]
  offchainSchema: string
  owner?: string
  schemaVersion: SchemaVersionTypes
  sponsorship: {
    confirmed?: string
    disabled?: string | null
    unconfirmed?: string | null
  }
  limits?: {
    accountTokenOwnershipLimit: string
    sponsoredDataSize: string
    sponsoredDataRateLimit: string
    sponsoredMintSize: string
    tokenLimit: string
    sponsorTimeout: string
    ownerCanTransfer: boolean
    ownerCanDestroy: boolean
  }
  variableOnChainSchema: string
  constOnChainSchema: string
}

export function useCollection() {
  const { rpcApi } = useApi()

  const getCollectionTokensCount = useCallback(
    async (collectionId: string) => {
      if (!rpcApi || !collectionId) {
        return []
      }

      try {
        return await rpcApi.query.nft.itemListIndex(collectionId)
      } catch (e) {
        console.log('getTokensOfCollection error', e)
      }

      return 0
    },
    [rpcApi]
  )

  const getCreatedCollectionCount = useCallback(async () => {
    if (!rpcApi) {
      return 0
    }
    try {
      return parseInt((await rpcApi.query.nft.createdCollectionCount()).toString(), 10)
    } catch (e) {
      console.log('getCreatedCollectionCount error', e)
    }

    return 0
  }, [rpcApi])

  const getCollectionAdminList = useCallback(
    async (collectionId: string) => {
      if (!rpcApi || !collectionId) {
        return []
      }

      try {
        return await rpcApi.query.nft.adminList(collectionId)
      } catch (e) {
        console.log('getCollectionAdminList error', e)
      }

      return []
    },
    [rpcApi]
  )

  const getDetailedCollectionInfo = useCallback(
    async (collectionId: string) => {
      if (!rpcApi) {
        return null
      }
      try {
        const collectionInfo =
        (
          // @ts-ignore
          await rpcApi.rpc.unique.collectionById(collectionId)
        ).toJSON() as unknown as NftCollectionInterface

        return {
          ...collectionInfo,
          id: collectionId,
        }
      } catch (e) {
        console.log('getDetailedCollectionInfo error', e)
      }

      return null
    },
    [rpcApi]
  )

  const getCollectionOnChainSchema = useCallback(
    (
      collectionInfo: NftCollectionInterface
    ): {
      constSchema: ProtobufAttributeType | undefined
      variableSchema: ProtobufAttributeType | undefined
    } => {
      const result: {
        constSchema: ProtobufAttributeType | undefined
        variableSchema: ProtobufAttributeType | undefined
      } = {
        constSchema: undefined,
        variableSchema: undefined,
      }

      try {
        const constSchema = hex2a(collectionInfo.constOnChainSchema)
        const varSchema = hex2a(collectionInfo.variableOnChainSchema)

        if (constSchema && constSchema.length) {
          result.constSchema = JSON.parse(constSchema) as ProtobufAttributeType
        }

        if (varSchema && varSchema.length) {
          result.variableSchema = JSON.parse(varSchema) as ProtobufAttributeType
        }

        return result
      } catch (e) {
        console.log('getCollectionOnChainSchema error')
      }

      return result
    },
    [hex2a]
  )

  const getTokensOfCollection = useCallback(
    async (collectionId: string, ownerId: string) => {
      if (!rpcApi || !collectionId || !ownerId) {
        return []
      }

      try {
        return await rpcApi.query.nft.addressTokens(collectionId, ownerId)
      } catch (e) {
        console.log('getTokensOfCollection error', e)
      }

      return []
    },
    [rpcApi]
  )

  return {
    getCollectionAdminList,
    getCollectionOnChainSchema,
    getCollectionTokensCount,
    getCreatedCollectionCount,
    getDetailedCollectionInfo,
    getTokensOfCollection,
  }
}
