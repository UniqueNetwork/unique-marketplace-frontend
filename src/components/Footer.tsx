import React, { FC } from 'react'

const Footer: FC = () => {
  return (
    <div className={'app-footer'}>
      <div className={'app-footer__info'}>
        <div className={'app-footer__info__powered'}>Powered by <a href="https://unique.network/">Unique Network</a> — the NFT chain built for Polkadot and Kusama.</div>
        <div className={'app-footer__info__version'}>Version 22.18.1560 </div>
      </div>
      <div className={'app-footer__social-links'}>
        <a href="https://t.me/Uniquechain">
          <img alt="telegram" src="/logos/telegram.svg" />
        </a>
        <a href="https://twitter.com/Unique_NFTchain">
          <img alt="twitter" src="/logos/twitter.svg" />
        </a>
        <a href="https://discord.gg/jHVdZhsakC">
          <img alt="discord" src="/logos/discord.svg" />
        </a>
        <a href="https://github.com/UniqueNetwork">
          <img alt="github" src="/logos/github.svg" />
        </a>
        <a href="https://app.subsocial.network/@UniqueNetwork_NFT">
          <img alt="subsocial" src="/logos/subsocial.svg" />
        </a>
      </div>
    </div>
  )
}

export default Footer