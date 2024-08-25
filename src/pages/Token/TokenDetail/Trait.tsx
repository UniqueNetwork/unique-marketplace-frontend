import { FCC } from 'react';
import styled from 'styled-components';
import { Text } from 'components/UI';

export interface ITraitProps {
  trait: string;
}

export const Trait: FCC<ITraitProps> = ({ trait }: ITraitProps) => (
  <TraitStyled>
    <Text
      size='s'
      weight='bold'
    >
      {trait}
    </Text>
  </TraitStyled>
);

const TraitStyled = styled.div`
  display: flex;
  flex-wrap: nowrap;
  padding: 0 8px;
  border-radius: 4px;
  .unique-text {
    color: var(--color-advanced-dark);
  }
  &:not(:last-of-type) {
    margin-right: 8px;
  }
`;
