import { FC } from 'react';
import styled from 'styled-components';
import { Loader } from '@unique-nft/ui-kit';

import { Text } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { AdditionalWarning100 } from 'styles/colors';

type FeeMessageProps = {
  isFeeLoading: boolean,
  fee: string
  testid: string
}

export const FeeMessage: FC<FeeMessageProps> = ({ isFeeLoading, fee, testid }) => {
  const { chainProperties, api } = useApi();
  return (
    <FeeMessageWrapper>
      <Text
        testid={`${testid}-text`}
        color='additional-warning-500'
        size='s'
      >
        {isFeeLoading
          ? <Loader label='Loading fee...' />
          : <>A fee of {fee === '0' ? 'some' : `~ ${Number(fee).toFixed(api?.market?.decimals || 18).replace(/(?<=\.\d*[1-9])0+$|\.0*$/, '')}`} {chainProperties?.token} can be applied to the transaction, unless the transaction is sponsored</>}
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
  background-color: ${AdditionalWarning100};
  width: 100%;

  .unique-loader {
    display: flex;
  }
`;
