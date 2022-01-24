import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
// import { useApi } from '../../hooks/useApi';
// import { namedLogos, chainLogos, nodeLogos, emptyLogos } from '../../logos';
// import ChainLogo from '../ChainLogo';
import logo from '../../logos/logo-white-label-market.svg';

// import { chainLogos, emptyLogos, namedLogos, nodeLogos } from '../logos';
// import { useApi } from '../hooks/useApi';

interface Props {
  className?: string;
  //   isInline?: boolean
  //   logo?: keyof typeof namedLogos
  //   onClick?: () => any
  //   withoutHl?: boolean
}

// function sanitize(value?: string): string {
//     return value?.toLowerCase().replace('-', ' ') || '';
// }

export function Header(): React.ReactElement<Props> {
  return (
    <HeaderStyled>
      <img src={logo} />
      <nav>
        <Link to='/'>Market</Link>
        <Link to='myTokens'>MyTokens</Link>
        <Link to='trades'>Trades</Link>
        <Link to='faq'>FAQ</Link>
      </nav>
    </HeaderStyled>
  );
}

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
`;
