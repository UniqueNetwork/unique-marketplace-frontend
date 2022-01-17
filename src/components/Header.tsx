import React, { FC, useCallback, useMemo } from 'react'
import { Select } from '@unique-nft/ui-kit'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import chains from '../chains'
import { chain } from '@polkadot/types/interfaces/definitions'

const Header: FC = () => {
  const { currentChain } = useApi()

  const navigate = useNavigate()

  const chainOptions = useMemo(() => {
    return Object.values(chains).map(({ id, name }) => ({
      id,
      title: name,
    }))
  }, [])

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
      <Link to={`/${currentChain ? currentChain?.id + '/' : ''}`}>
        <img src="/logos/unique.svg" alt="Logo" className="header__logo" />
      </Link>
      <Select options={chainOptions} value={currentChain?.id} onChange={onSelectChange} />
    </div>
  )
}

export default Header
