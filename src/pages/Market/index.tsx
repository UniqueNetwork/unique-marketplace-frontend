import styled from 'styled-components';
import { TokensCard } from '../../components';

const MarketPage = () => {
  return (
    <MarketPageStyled>
      <div className='left-column'>Filters</div>
      <div className='main-content'>cards<TokensCard /></div>
    </MarketPageStyled>
  );
};

const MarketPageStyled = styled.div`
 display: flex;
 

  .left-column{
  
  height:500px;
  padding-right:24px;
    border-right: 1px solid grey;
 
  }

  .main-content{
    padding:0 24px;
  }

`;

export default MarketPage;
