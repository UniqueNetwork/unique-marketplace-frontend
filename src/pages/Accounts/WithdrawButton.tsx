import { Button, Tooltip } from 'components/UI';
import { useRef } from 'react';
import styled from 'styled-components';

type WithdrawButtonProps = {
  amount: string
  onWithdraw(): void
  testid: string
};

export const WithdrawButton = ({ amount, onWithdraw, testid }: WithdrawButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  return <>
    <Tooltip
      align={{
        vertical: 'top',
        horizontal: 'middle',
        appearance: 'vertical'
       }}
      targetRef={buttonRef}
    >
      {`Withdraw ${amount}`}
    </Tooltip>
    <Button
      title={
        <WithdrawTitleWrapper
          ref={buttonRef}
        >{`Withdraw ${amount}`}</WithdrawTitleWrapper>}
      onClick={onWithdraw}
      role={'primary'}
      testid={testid}
    />
  </>;
};

const WithdrawTitleWrapper = styled.div`
  display: inline;
  text-overflow: ellipsis;
  overflow: hidden;
`;
