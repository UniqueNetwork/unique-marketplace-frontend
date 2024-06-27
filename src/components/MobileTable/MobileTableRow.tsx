import styled from 'styled-components';

export const MobileTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px dashed var(--color-grey-300);
  grid-row-gap: var(--prop-gap);
  grid-column-gap: calc(var(--prop-gap) / 2);
  padding: var(--prop-gap) 0;
  position: relative;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const BalancesWrap = styled.div`
  grid-column: span 2;
  > div {
    width: 100%;
  }
`;

