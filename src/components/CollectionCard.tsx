import React, { FC, useCallback, useEffect, useState } from 'react'
import Avatar from './Avatar'
import AccountLinkComponent from '../pages/Account/components/AccountLinkComponent'
import { Collection } from '../api/graphQL/collections'
import { SchemaVersionTypes, useMetadata } from '../api/chainApi/hooks/useMetadata'
import { useCollection } from '../api/chainApi/hooks/useCollection'

// tslint:disable-next-line:no-empty-interface
interface CollectionCardProps extends Collection {}

const CollectionCard: FC<CollectionCardProps> = (props) => {
  const {
    name,
    collection_id: collectionId,
    token_prefix: tokenPrefix,
    tokens_aggregate: tokensAggregate,
    schema_version: schemaVersion,
    offchain_schema: offchainSchema,
    owner,
  } = props

  const tokensCount = tokensAggregate.aggregate.count

  const [collectionImageUrl, setCollectionImageUrl] = useState<string>()

  const { getDetailedCollectionInfo } = useCollection()
  const { getTokenImageUrl } = useMetadata()

  const defineCollectionImage = useCallback(async () => {
    const collectionInfo = await getDetailedCollectionInfo(collectionId.toString())
    console.log(collectionInfo)
    if (collectionInfo) {
      const collectionImage = await getTokenImageUrl(collectionInfo, '1')
      console.log(collectionImage)
      setCollectionImageUrl(collectionImage)
    }
  }, [collectionId, getTokenImageUrl])

  useEffect(() => {
    defineCollectionImage()
  }, [])

  return (
    <div
      className={
        'grid-item_col4 flexbox-container flexbox-container_align-start card margin-bottom'
      }
    >
      <div style={{minWidth: '40px'}}>
        <Avatar size={'small'} src={collectionImageUrl} />
      </div>
      <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap'}>
        <h4>{name}</h4>
        <div className={'flexbox-container'}>
          <span>
            <span className={'text_grey'}>ID:</span>
            {collectionId}
          </span>
          <span>
            <span className={'text_grey'}>Prefix:</span>
            {tokenPrefix}
          </span>
          <span>
            <span className={'text_grey'}>Items:</span>
            {tokensCount}
          </span>
        </div>
        <div>
          <span className={'text_grey'}>Owner: </span>
          <AccountLinkComponent value={owner} />
        </div>
      </div>
    </div>
  )
}

export default CollectionCard
