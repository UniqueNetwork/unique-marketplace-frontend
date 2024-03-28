import React, { VFC } from 'react';
import styled from 'styled-components';
import { Text } from 'components/UI';
import { Icon, IconProps } from 'components/UI/Icon/Icon';

interface EmptyTableProps {
  iconProps?: Omit<IconProps, 'size'>
}

const EmptyTable: VFC<EmptyTableProps> = ({ iconProps }) => {
  return (
    <NoItemsWrapper>
      <Icon {...iconProps} size={80} />
      <Text size={'l'} color={'blue-grey-500'}>Nothing found</Text>
    </NoItemsWrapper>
  );
};

const NoItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--prop-gap) * 1.5);
  width: 100%;
  height: 640px;
  align-items: center;
  justify-content: center;
  @media (max-width: 567px) {
    height: 340px;
  }
`;

export default EmptyTable;
