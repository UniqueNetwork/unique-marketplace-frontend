import React, { FC } from 'react'
import { Select } from '@unique-nft/ui-kit'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import chains from '../chains'

const Header: FC = () => {
  const { currentChain, onChangeChain } = useApi()

  return (
    <div className={'flexbox-container flexbox-container_space-between full-width'}>
      <Link to="/">
        <img src="/logos/unique.svg" alt="Logo" className="header__logo" />
      </Link>
      <Select
        options={Object.keys(chains)}
        value={currentChain?.name}
        onChange={(value) => value && chains[value] && onChangeChain(chains[value])}
      />
    </div>
  )
}

export default Header
