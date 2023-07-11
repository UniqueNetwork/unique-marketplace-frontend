import { NumberInput } from 'components/NumberInput/NumberInput';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Coral700 } from 'styles/colors';
import { formatBlockNumber } from 'utils/textUtils';
import { Skeleton, Text } from '@unique-nft/ui-kit';

type FractionalAmountInputProps = {
  tokenId: number
  collectionId: number
  amount: number
  className?: string
  onChangeAmount(amount: number): void
  onChangeIsAmountValid(valid: boolean): void
};

export const FractionalAmountInput = ({ tokenId, collectionId, amount, className, onChangeAmount, onChangeIsAmountValid }: FractionalAmountInputProps) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [amountString, setAmountString] = useState('1');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isFetchingAmount, setIsFetchingAmount] = useState(false);

  useEffect(() => {
    if (!collectionId || !selectedAccount?.address) return;
    void (async () => {
      setIsFetchingAmount(true);
      const totalAmount = await api?.rft?.getTokenBalance(collectionId, tokenId, selectedAccount?.address);
      setTotalAmount(totalAmount?.amount || 0);
      setIsFetchingAmount(false);
    })();
  }, [collectionId, tokenId, selectedAccount?.address]);

  const onSetMaxAmount = useCallback(() => {
    setAmountString(totalAmount.toString());
    onChangeAmount(totalAmount);
  }, [totalAmount, onChangeAmount]);

  const onChangeAmountInput = useCallback((value: string) => {
    setAmountString(value);
    onChangeAmount(Number(value));
  }, [onChangeAmount]);

  const isAmountValid = useMemo(() => {
    const isValid = !!amount && amount !== 0 && amount <= totalAmount;
    onChangeIsAmountValid(isValid);
    return isValid;
  }, [amount, totalAmount, onChangeIsAmountValid]);

  if (isFetchingAmount) {
    return <AmountInputWrapper className={className}>

      <Skeleton height={22} width={'100%'} />
      <Skeleton height={38} width={'100%'} />
    </AmountInputWrapper>;
  }

  return <AmountInputWrapper className={className}>
    <AmountInputStyled
      loading={isFetchingAmount}
      label='Number of fractions to be sent'
      additionalText={isFetchingAmount ? 'Loading...' : `You own: ${formatBlockNumber(totalAmount)}`}
      value={amountString}
      onChange={onChangeAmountInput}
      onSetMax={onSetMaxAmount}
    />
    {!isAmountValid && <InvalidAmountWrapper>
      <Text size={'s'}>Invalid number of fractions</Text>
    </InvalidAmountWrapper>}
  </AmountInputWrapper>;
};

const AmountInputWrapper = styled.div`
  width: 100%;
  margin-bottom: calc(var(--gap) * 2);
`;

const AmountInputStyled = styled(NumberInput)`
  width: 100%;
`;

const InvalidAmountWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  right: calc(var(--gap) * 1.5);
  height: 0;
  span {
    color: ${Coral700} !important;
  }
`;
