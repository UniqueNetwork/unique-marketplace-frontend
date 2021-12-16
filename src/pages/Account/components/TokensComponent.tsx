import React, { FC, Reducer, useCallback, useEffect, useReducer, useState } from 'react'
import { Checkbox, Icon, InputText } from '@unique-nft/ui-kit'
import { useQuery } from '@apollo/client'
import {
  Token,
  tokensQuery,
  Data as tokensData,
  Variables as TokensVariables,
} from '../../../api/graphQL/tokens'
import Button from '../../../components/Button'
import Avatar from '../../../components/Avatar'


interface TokensComponentProps {
  accountId: string
}

const TokenCard: FC<Token> = (props) => (
  <div className={'grid-item_col1 card margin-bottom flexbox-container_column'}>
    <Avatar size={'small'} />
    <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap'}>

      <div>{props.token_id}</div>
      <div>{props.collection.name}</div>
      <div className={'text_grey'}>Transfers: 0</div>
    </div>
  </div>
);

type ActionType = 'All' | 'Minted' | 'Received';

const TokensComponent: FC<TokensComponentProps> = (props) => {
  const { accountId } = props;

  const [filter, dispatchFilter] = useReducer<Reducer<Record<string, any> | undefined, {type: ActionType, value: string | boolean}>>((state, action) => {
    if (action.type === 'All' && action.value) {
      return undefined;
    }
    if (action.type === 'Minted') {
      return { ...state, minted: action.value ? { _eq: accountId } : undefined };
    }
    if (action.type === 'Received') {
      return { ...state, received: action.value ? { _eq: accountId } : undefined };
    }
    return state;
  }, undefined);

  const [searchString, setSearchString] = useState<string | undefined>();

  const {
    fetchMore,
    data: collections,
  } = useQuery<tokensData, TokensVariables>(tokensQuery, {
    variables: {
      limit: 6, offset: 0,
    }});

  const fetchMoreCollections = useCallback(() => {
    const prettifiedBlockSearchString = searchString?.match(/[^$,.\d]/) ? -1 : searchString
    fetchMore({
      variables: {
        where: {
          ...(searchString &&
          searchString.length > 0 ? {
            name: { _eq: prettifiedBlockSearchString },
          } : {}),
          ...(filter ? {_or: filter} : {})
        },
      },
    })
  }, [filter, searchString]);

  useEffect(() => {
    fetchMoreCollections()
  }, [filter])

  const onCheckBoxChange = useCallback(
    (actionType: ActionType) => (value: boolean) => dispatchFilter({type: actionType, value}),
    [dispatchFilter]
  )

  const onSearchChange = useCallback((value: string | number | undefined) => setSearchString(value?.toString()), [setSearchString])

  const onSearchClick = useCallback(() => {
    fetchMoreCollections();
  }, [fetchMoreCollections, searchString])


  return (
    <>
      <div className={'flexbox-container flexbox-container_space-between margin-top'}>
        <div className={'flexbox-container flexbox-container_half-gap'} >
          <InputText placeholder={'Collection name'}  onChange={onSearchChange} />
          <Button text={'Search'} onClick={onSearchClick} />
        </div>
        <div className={'flexbox-container'}>
          <Checkbox label={'All'} size={'s'} checked={filter === undefined} onChange={onCheckBoxChange('All')}/>
          <Checkbox label={'Minted'} size={'s'} checked={!!filter?.owner} onChange={onCheckBoxChange('Minted')}/>
          <Checkbox label={'Received'} size={'s'} checked={!!filter?.admin} onChange={onCheckBoxChange('Received')}/>
        </div>
      </div>
      <div className={'margin-top margin-bottom'}>{collections?.tokens_aggregate?.aggregate?.count || 0} items</div>
      <div className={'grid-container'}>
        {collections?.tokens.map((token) => <TokenCard {...token} />)}
      </div>
      <Button text={'See all'} iconPosition={'right'} icon={<Icon name={'arrow-right'} size={10} color={'white'}/>} />
    </>
  )
}

export default TokensComponent
