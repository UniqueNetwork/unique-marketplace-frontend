import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import logo from '../../logos/logo-white-label-market.svg';

export const Header: FC = () => {
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
};

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;

  a {
    margin-left: 16px;
  }
`;
