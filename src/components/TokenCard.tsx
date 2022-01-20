import React, { FC, useCallback, useEffect, useState } from 'react'
import { Heading } from '@unique-nft/ui-kit'
import { Token } from '../api/graphQL'
import Picture from './Picture'
import { useApi } from '../hooks/useApi'
import { NFTToken } from '../api/chainApi/unique/types'

// tslint:disable-next-line:no-empty-interface
interface TokenCardProps extends Token {}

const TokenCard: FC<TokenCardProps> = (props) => {
  const { token_id: tokenId, collection_id: collectionId, collection } = props

  const [tokenImageUrl, setTokenImageUrl] = useState<string>()

  const { rpcClient, api } = useApi()

  const fetchToken = useCallback(async () => {
    if (rpcClient?.isApiConnected) {
      const token: NFTToken = await api?.getToken(collectionId, tokenId)
      setTokenImageUrl(token.imageUrl)
    }
  }, [collectionId, rpcClient?.isApiConnected])

  useEffect(() => {
    fetchToken()
  }, [])

  return (
    <div className={'grid-item_col1 card margin-bottom flexbox-container_column'}>
      <Picture alt={tokenId.toString()} src={tokenImageUrl} />
      <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap'}>
        <Heading size={'4'}>{`${collection.token_prefix || ''} #${tokenId}`}</Heading>
        <div>
          <a>
            {props.collection.name} [ID&nbsp;{collectionId}]
          </a>
        </div>
        <div className={'text_grey margin-top'}>Transfers: 0</div>
      </div>
    </div>
  )
}

export default TokenCard
