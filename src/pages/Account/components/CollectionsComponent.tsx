import React, { FC, Reducer, useCallback, useReducer, useState } from 'react'
import { InputText, Checkbox, Button } from '@unique-nft/ui-kit'
import { Collection, collections as gqlCollection } from '../../../api/graphQL'
import CollectionCard from '../../../components/CollectionCard'

interface CollectionsComponentProps {
  accountId: string
}

type ActionType = 'All' | 'Owner' | 'Admin' | 'Sponsor' | 'Received'

const pageSize = 6

const CollectionsComponent: FC<CollectionsComponentProps> = (props) => {
  const { accountId } = props

  const [filter, dispatchFilter] = useReducer<
    Reducer<Record<string, any> | undefined, { type: ActionType; value: string | boolean }>
  >((state, action) => {
    if (action.type === 'All' && action.value) {
      return undefined
    }
    if (action.type === 'Owner') {
      return { ...state, owner: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Admin') {
      return { ...state, admin: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Sponsor') {
      return { ...state, sponsor: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Received') {
      return { ...state, received: action.value ? { _eq: accountId } : undefined }
    }
    return state
  }, undefined)

  const [searchString, setSearchString] = useState<string | undefined>()

  const { fetchMoreCollections, collections, collectionsCount } =
    gqlCollection.useGraphQlCollections({
      pageSize,
    })

  const onCheckBoxChange = useCallback(
    (actionType: ActionType) => (value: boolean) => dispatchFilter({ type: actionType, value }),
    [dispatchFilter]
  )

  const onSearchChange = useCallback(
    (value: string | number | undefined) => setSearchString(value?.toString()),
    [setSearchString]
  )

  const onSearchClick = useCallback(() => {
    fetchMoreCollections({ searchString })
  }, [fetchMoreCollections, searchString])

  return (
    <>
      <div className={'flexbox-container flexbox-container_space-between margin-top'}>
        <div className={'flexbox-container flexbox-container_half-gap'}>
          <InputText placeholder={'Collection name'} onChange={onSearchChange} />
          <Button title={'Search'} role="primary" onClick={onSearchClick} />
        </div>
        <div className={'flexbox-container'}>
          <Checkbox
            label={'All'}
            size={'s'}
            checked={filter === undefined}
            onChange={onCheckBoxChange('All')}
          />
          <Checkbox
            label={'Owner'}
            size={'s'}
            checked={!!filter?.owner}
            onChange={onCheckBoxChange('Owner')}
          />
          <Checkbox
            label={'Admin'}
            size={'s'}
            checked={!!filter?.admin}
            onChange={onCheckBoxChange('Admin')}
          />
          <Checkbox
            label={'Sponsor'}
            size={'s'}
            checked={!!filter?.sponsor}
            onChange={onCheckBoxChange('Sponsor')}
          />
          <Checkbox
            label={'Received'}
            size={'s'}
            checked={!!filter?.received}
            onChange={onCheckBoxChange('Received')}
          />
        </div>
      </div>
      <div className={'margin-top margin-bottom'}>{collectionsCount || 0} items</div>
      <div className={'grid-container'}>
        {collections?.map &&
          collections.map((collection: Collection) => (
            <CollectionCard key={`collection-${collection.collection_id}`} {...collection} />
          ))}
      </div>
      <Button
        title={'See all'}
        iconRight={{
          color: '#fff',
          name: 'arrow-right',
          size: 12,
        }}
        role="primary"
        onClick={() => {}}
      />
    </>
  )
}

export default CollectionsComponent
