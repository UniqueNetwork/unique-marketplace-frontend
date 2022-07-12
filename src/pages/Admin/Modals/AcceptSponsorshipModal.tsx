import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import styled from 'styled-components/macro';
import AccountCard from '../../../components/Account/Account';
import { useFee } from '../../../hooks/useFee';
import StagesModal from '../../Token/Modals/StagesModal';
import { useAcceptSponsorshipStages } from '../../../hooks/adminStages/useAcceptSponsorshipStages';
import { useApi } from '../../../hooks/useApi';
import { NFTCollection } from '../../../api/chainApi/unique/types';
import { useRejectSponsorshipStages } from 'hooks/adminStages/useRejectSponsorshipStages';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';

const tokenSymbol = 'KSM';

export const AcceptSponsorshipModal: FC<TAdminPanelModalBodyProps> = ({ collection, setIsClosable, onFinish }) => {
  const { kusamaFee } = useFee();
  const [step, setStep] = useState<'ask' | 'accept-stages' | 'reject-stages'>('ask');
  const { initiate: initiateAccept, status: acceptStatus, stages: acceptStages } = useAcceptSponsorshipStages(collection?.id || 0);
  const { initiate: initiateReject, status: rejectStatus, stages: rejectStages } = useRejectSponsorshipStages(collection?.id || 0);

  const onRefuseClick = useCallback(() => {
    setIsClosable(false);
    setStep('reject-stages');
    initiateReject(null);
  }, []);

  const onConfirmClick = useCallback(() => {
    setIsClosable(false);
    setStep('accept-stages');
    initiateAccept(null);
  }, []);

  const { api } = useApi();
  const collectionApi = api?.collection;
  const [collectionDetails, setCollectionDetails] = useState<NFTCollection | null>();
  useEffect(() => {
    if (!collection) return;
    (async () => {
      setCollectionDetails(await collectionApi?.getCollection(collection.id));
    })();
  }, [collection, collectionApi]);
  if (!collection) return null;

  if (step === 'accept-stages') { return (<StagesModal stages={acceptStages} status={acceptStatus} onFinish={onFinish} />); }
  if (step === 'reject-stages') { return (<StagesModal stages={rejectStages} status={rejectStatus} onFinish={onFinish} />); }

  return (
    <>
      <Content>
        <Heading size='2'>Accept sponsorship</Heading>
      </Content>
      <Row>
        <Text size={'m'}>{`The author of the collection "${collection?.name || collection?.collectionName}" [ID ${collection?.id}] has chosen this address as a sponsor. Do you confirm the choice?`}</Text>
      </Row>
      <AddressWrapper>
        {collectionDetails?.sponsorship?.unconfirmed && <AccountCard
          accountName={''}
          accountAddress={collectionDetails?.sponsorship?.unconfirmed || ''}
          canCopy
          hideName
        />}
      </AddressWrapper>
      <WarningBlock>
        {`A fee of ~ ${kusamaFee} ${tokenSymbol} can be applied to the transaction if you accept this sponsor`}
      </WarningBlock>
      <ButtonWrapper>
        <Button
          onClick={onRefuseClick}
          title='Refuse'
        />
        <Button
          onClick={onConfirmClick}
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  column-gap: var(--gap);
  gap: calc(var(--gap) / 2);
  @media (max-width: 567px) {
    justify-content: normal;
    button {
      width: 100%;
    }
  }
`;
