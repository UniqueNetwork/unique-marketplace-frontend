import { Button } from '@unique-nft/ui-kit';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAccounts } from '../../hooks/useAccounts';

import logo from '../../logos/logo-white-label-market.svg';

export const Header: FC = () => {
  const [allAccounts] = useAccounts();

  const buttonClick = () => {
    console.log('button is clicked');
  };

  console.log('allAccounts', allAccounts);

  const account = allAccounts.length !== 0
    ? allAccounts[0].address
    : <Button
      onClick={buttonClick}
      role='outlined'
      title='Create or connect account'
      />;

    const balance = 0;

  return (
    <HeaderStyled>
      <div className='left-side'>
        <img src={logo} />
        <nav>
          <Link to='/'>Market</Link>
          <Link to='myTokens'>MyTokens</Link>
          <Link to='trades'>Trades</Link>
          <Link to='faq'>FAQ</Link>
        </nav>
      </div>
      <div className='right-side'>
        <div className='balance'>Balance {balance}</div>
        {account}
      </div>
    </HeaderStyled>
  );
};

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .left-side{
    display: flex;
    align-items: center;
  }

  .right-side{
    display: flex;
    align-items: center;
  }

  a {
    margin-left: 16px;
  }

  .balance {
    margin-left: 16px;
    margin-right: 16px;
  }
`;
