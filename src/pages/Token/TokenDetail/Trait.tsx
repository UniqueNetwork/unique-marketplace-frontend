import { FC } from 'react';
import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { BlueGrey100 } from '../../../styles/colors';

export interface ITraitProps {
  trait: string;
}

export const Trait: FC<ITraitProps> = ({ trait }: ITraitProps) => (
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
