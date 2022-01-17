import React, { FC, useCallback, useEffect, useState } from 'react'
import { AttributesDecoded, SchemaVersionTypes, useMetadata } from '../api/chainApi/hooks/useMetadata'
import { Token } from '../api/graphQL/tokens'
import Picture from './Picture'
import { useCollection } from '../api/chainApi/hooks/useCollection'
import { Heading } from '@unique-nft/ui-kit'

// tslint:disable-next-line:no-empty-interface
interface TokenCardProps extends Token {}

const TokenCard: FC<TokenCardProps> = (props) => {
  const { token_id: tokenId, collection_id: collectionId, owner } = props

  const [tokenImageUrl, setTokenImageUrl] = useState<string>()
  const [tokenAttributes, setTokenAttributes] = useState<AttributesDecoded>()

  const { getDetailedCollectionInfo } = useCollection()
  const { getTokenImageUrl, getTokenAttributes } = useMetadata()

  const defineTokenImage = useCallback(async () => {
    const collectionInfo = await getDetailedCollectionInfo(collectionId.toString())
    // const tokenInfo = await getDetailedTokenInfo(collectionId.toString(), tokenId.toString())

    // console.log(tokenInfo)
    if (collectionInfo) {
      const _tokenAttributes = await getTokenAttributes(collectionInfo, tokenId.toString())
      setTokenAttributes(_tokenAttributes)
      console.log(_tokenAttributes)
      const tokenImage = await getTokenImageUrl(collectionInfo, tokenId.toString())
      console.log(tokenImage)
      setTokenImageUrl(tokenImage)
    }
  }, [collectionId, getTokenImageUrl])

  useEffect(() => {
    defineTokenImage()
  }, [])

  return (
    <div className={'grid-item_col1 card margin-bottom flexbox-container_column'}>
      <Picture alt={tokenId.toString()} src={tokenImageUrl} />
      <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap'}>
        <Heading size={'4'}>{`${tokenAttributes && tokenAttributes['Badge Type']} #${tokenId}`}</Heading>
        <div><a>{props.collection.name} [ID&nbsp;{collectionId}]</a></div>
        <div className={'text_grey margin-top'}>Transfers: 0</div>
      </div>
    </div>
  )
}

export default TokenCard
