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
      weight='regular'
    >
      {trait}
    </Text>
  </TraitStyled>
);

const TraitStyled = styled.div`
  display: flex;
  flex-wrap: nowrap;
  padding: 1px 8px;
  border-radius: 4px;
  background-color: ${BlueGrey100};
  .unique-text {
    color: var(--color-secondary-300);
  }
  &:not(:last-of-type) {
    margin-right: 8px;
  }
`;
