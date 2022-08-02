import styled from 'styled-components';

export const MobileTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px dashed var(--color-grey-300);
  grid-row-gap: var(--gap);
  grid-column-gap: calc(var(--gap) / 2);
  padding: var(--gap) 0;
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
