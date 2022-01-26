import { Button } from '@unique-nft/ui-kit';
import { FC } from 'react';
import styled from 'styled-components';
import { Picture } from '..';

export const TokensCard: FC = () => {
    return (
        <TokensCardStyled>
            <div className='pict'>
                <Picture alt='avatar' />
            </div>
        </TokensCardStyled>
    );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: center;

  .pict{
      width: 268px;
      height: 268px;
      svg{
        border-radius: 8px;
      }
  }
`;
