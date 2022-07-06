import React, { FC, useCallback } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import styled from 'styled-components/macro';
import { useAccounts } from '../../../hooks/useAccounts';
import AccountCard from '../../../components/Account/Account';
import { AdditionalWarning100 } from '../../../styles/colors';
import { useFee } from '../../../hooks/useFee';

const tokenSymbol = 'KSM';

export const AcceptSponsorshipModal: FC<TAdminPanelModalBodyProps> = ({ collection, onClose }) => {
  const { selectedAccount } = useAccounts();
  const { kusamaFee } = useFee();

  const onRefuseClick = useCallback(() => {
    onClose();
  }, []);

  const onAcceptClick = useCallback(() => {
    onClose();
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Accept sponsorship</Heading>
      </Content>
      <Row>
        <Text size={'m'}>The author of the collection “collection name” has chosen this address as a sponsor. Do you confirm the choice?</Text>
      </Row>
      <AddressWrapper>
        <AccountCard
          accountName={selectedAccount?.meta.name || ''}
          accountAddress={selectedAccount?.address || ''}
          canCopy={true}
          hideName
          isShort
        />
      </AddressWrapper>
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ ${kusamaFee} ${tokenSymbol} can be applied to the transaction if you accept this sponsor`}
      </TextStyled>
      <ButtonWrapper>
        <Button
          onClick={onRefuseClick}
          title='Refuse'
        />
        <Button
          onClick={onAcceptClick}
          role='primary'
          title='Accept'
        />
      </ButtonWrapper>
    </>
  );
};

const Content = styled.div`
  && h2 {
    margin-bottom: calc(var(--gap) * 1.5);
  }
  @media (max-width: 567px) {
    && h2 {
      font-size: 24px;
      line-height: 36px;
    }
  }
`;

const Row = styled.div`
`;

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  margin: calc(var(--gap)) 0 calc(var(--gap) * 2);
  align-items: center;
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .icon-copy {
    width: 24px;
    height: 24px;
  }
`;

const TextStyled = styled(Text)`
  box-sizing: border-box;
  display: flex;
  padding: 8px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
  background-color: ${AdditionalWarning100};
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--gap) / 2);
  @media (max-width: 567px) {
    justify-content: normal;
    button {
      width: 100%;
    }
  }
`;
