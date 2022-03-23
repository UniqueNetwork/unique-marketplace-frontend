import { FC } from 'react';
import styled from 'styled-components/macro';
import { useGetIcon } from './useGetIcon';

interface IComponentProps {
  path: string;
}

export const Icon: FC<IComponentProps> = ({
  path
}: IComponentProps) => {
  const icon = useGetIcon(path);

  return (
    <IconStyled dangerouslySetInnerHTML={{ __html: icon }} />
  );
};

const IconStyled = styled.span`
  svg {
    fill: currentColor;

    path {
      fill: inherit;
      stroke: currentColor;
    }
  }
`;
