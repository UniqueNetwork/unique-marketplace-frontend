import React, { FC } from 'react'
import { Select } from '@unique-nft/ui-kit';
import { chains } from '../config';
import { useApi } from '../hooks/useApi'


const Header: FC = () => {

  const { currentChain, onChangeChain } = useApi()

  return (<div className={'flexbox-container flexbox-container_space-between full-width'}>
    <a href="/">
      <img
      src="/logos/unique.svg"
      alt="Logo" className="header__logo" />
    </a>
    <Select options={Object.keys(chains)} value={currentChain?.name} onChange={(value) => value && chains[value] && onChangeChain(chains[value])} />
  </div>);
}

export default Header
