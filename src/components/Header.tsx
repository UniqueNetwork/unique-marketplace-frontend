import React, { FC, useCallback } from 'react'
import { Select } from '@unique-nft/ui-kit'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import config from '../config'

const Header: FC = () => {
  const { currentChain } = useApi()

  const navigate = useNavigate()
  const onSelectChange = useCallback(
    (value?: string) => {
      if (value) {
        navigate(`${value}/`)
      }
    },
    [currentChain]
  )

  return (
    <div className={'flexbox-container flexbox-container_space-between full-width'}>
      <Link to={`/${currentChain ? currentChain?.network + '/' : ''}`}>
        <img src="/logos/unique.svg" alt="Logo" className="header__logo" />
      </Link>
      <Select
        options={Object.values(config.chains).map(({ network, name }) => ({
          id: network,
          title: name,
        }))}
        value={currentChain?.network}
        onChange={onSelectChange}
      />
    </div>
  )
}

export default Header
