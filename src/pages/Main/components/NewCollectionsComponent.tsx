import React, { FC } from 'react'
import { Icon } from '@unique-nft/ui-kit'
import Button from '../../../components/Button'
import Avatar from '../../../components/Avatar'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
import { Collection } from '../../../api/graphQL'

interface CollectionsComponentProps {
  collections: Collection[]
}

const CollectionCard: FC<Collection> = (props) => (
  <div
    className={'grid-item_col4 flexbox-container flexbox-container_align-start card margin-bottom'}
  >
    <Avatar size={'small'} />
    <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap'}>
      <h4>{props.name}</h4>
      <div className={'flexbox-container'}>
        <span>
          <span className={'text_grey'}>ID:</span>
          {props.collection_id}
        </span>
        <span>
          <span className={'text_grey'}>Prefix:</span>
          {props.token_prefix}
        </span>
        <span>
          <span className={'text_grey'}>Items:</span>
          {props.tokens_aggregate.aggregate.count}
        </span>
      </div>
      <div>
        <span className={'text_grey'}>Owner: </span>
        <AccountLinkComponent value={props.owner} />
      </div>
    </div>
  </div>
)

const CollectionsComponent: FC<CollectionsComponentProps> = (props) => {
  const { collections } = props

  return (
    <>
      <div className={'grid-container'}>
        {collections.map((collection) => (
          <CollectionCard {...collection} />
        ))}
      </div>
      <Button
        text={'See all'}
        iconPosition={'right'}
        icon={<Icon name={'arrow-right'} size={10} color={'white'} />}
      />
    </>
  )
}

export default CollectionsComponent
