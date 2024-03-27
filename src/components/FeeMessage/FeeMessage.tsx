import { FC } from 'react';
import styled from 'styled-components';

import { Text, Loader } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { AdditionalWarning100 } from 'styles/colors';

type FeeMessageProps = {
  isFeeLoading: boolean,
  fee: string
  testid: string
  placeholder?: string
}

export const FeeMessage: FC<FeeMessageProps> = ({
  isFeeLoading,
  fee,
  testid,
  placeholder
}) => {
  const { chainProperties } = useApi();
  placeholder = placeholder || `A fee of some ${chainProperties?.token} can be applied to the transaction, unless the transaction is sponsored`;
  return (
    <FeeMessageWrapper>
      <Text
        testid={`${testid}-text`}
        color='primary-500'
        size='s'
      >
        {isFeeLoading && <Loader label='Loading fee...' />}
        {!isFeeLoading && fee === '0' && placeholder}
        {!isFeeLoading && fee !== '0' && <>A fee of ~ {Number(fee).toFixed(4).replace(/(\.\d*[1-9])(0+$|\.0*)$/, '$1')} {chainProperties?.token} can be applied to the transaction, unless the transaction is sponsored</>}
      </Text>
    </FeeMessageWrapper>
  );
};

const FeeMessageWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin: calc(var(--gap) * 1.5) 0;
  border-radius: 4px;
  background-color: var(--color-primary-100);
  width: 100%;

  .unique-loader {
    display: flex;
  }
`;
