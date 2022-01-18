import React, { FC, Reducer, useCallback, useReducer, useState } from 'react'
import { Checkbox, InputText, Button } from '@unique-nft/ui-kit'
import { Token, useGraphQlTokens } from '../../../api/graphQL/tokens'
import Avatar from '../../../components/Avatar'
import Picture from '../../../components/Picture'
import TokenCard from '../../../components/TokenCard'

interface TokensComponentProps {
  accountId: string
}

type ActionType = 'All' | 'Minted' | 'Received'

const pageSize = 18

const TokensComponent: FC<TokensComponentProps> = (props) => {
  const { accountId } = props

  const [filter, dispatchFilter] = useReducer<
    Reducer<Record<string, any> | undefined, { type: ActionType; value: string | boolean }>
  >((state, action) => {
    if (action.type === 'All' && action.value) {
      return undefined
    }
    if (action.type === 'Minted') {
      return { ...state, minted: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Received') {
      return { ...state, received: action.value ? { _eq: accountId } : undefined }
    }
    return state
  }, undefined)

  const [searchString, setSearchString] = useState<string | undefined>()

  const { fetchMoreTokens, tokens, tokensCount } = useGraphQlTokens({ filter, pageSize })

  const onCheckBoxChange = useCallback(
    (actionType: ActionType) => (value: boolean) => dispatchFilter({ type: actionType, value }),
    [dispatchFilter]
  )

  const onSearchChange = useCallback(
    (value: string | number | undefined) => setSearchString(value?.toString()),
    [setSearchString]
  )

  const onSearchClick = useCallback(() => {
    fetchMoreTokens({ searchString })
  }, [fetchMoreTokens, searchString])

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
            label={'Minted'}
            size={'s'}
            checked={!!filter?.owner}
            onChange={onCheckBoxChange('Minted')}
          />
          <Checkbox
            label={'Received'}
            size={'s'}
            checked={!!filter?.admin}
            onChange={onCheckBoxChange('Received')}
          />
        </div>
      </div>
      <div className={'margin-top margin-bottom'}>{tokensCount || 0} items</div>
      <div className={'grid-container'}>
        {tokens?.map && tokens.map((token) => <TokenCard {...token} key={`token-${token.id}`} />)}
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

export default TokensComponent
