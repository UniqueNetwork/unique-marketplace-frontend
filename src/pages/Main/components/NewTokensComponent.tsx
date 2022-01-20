import React, { FC } from 'react'
import Button from '../../../components/Button'
import { Icon, Text } from '@unique-nft/ui-kit'
import { Token } from '../../../api/graphQL'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
import Picture from '../../../components/Picture'

interface NewTokensComponentProps {
  tokens: Token[]
}

const NewTokensComponent: FC<NewTokensComponentProps> = (props) => {
  const { tokens } = props
  return (
    <div>
      <div className={'flexbox-container flexbox-container_align-start margin-bottom'}>
        {tokens.map((token) => (
          <div key={`token-${token.id}`} className={'flexbox-container_max-growth'}>
            <Picture alt={token.id.toString()} />
            <div>{token.id}</div>
            <div>
              {token.collection.name} [ID {token.collection_id}]
            </div>
            <div>
              <Text size={'s'} color={'grey-500'}>
                Owner:
              </Text>
              <AccountLinkComponent value={token.owner} />
            </div>
          </div>
        ))}
      </div>
      <Button
        text={'See all'}
        iconPosition={'right'}
        icon={<Icon name={'arrow-right'} size={10} color={'white'} />}
      />
    </div>
  )
}

export default NewTokensComponent
