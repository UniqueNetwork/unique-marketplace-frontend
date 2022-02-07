import { FC } from 'react';
import styled from 'styled-components/macro';
import { SellModal } from '../Modals/sell/SellModal';

export const Filters: FC = () => {
  return <FiltersStyled><SellModal /></FiltersStyled>;
};

const FiltersStyled = styled.div`
  width: 235px;
`;
