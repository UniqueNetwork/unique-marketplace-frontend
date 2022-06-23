import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Heading, Text } from '@unique-nft/ui-kit';
import { TAdminPanelModalBodyProps } from './AdminPanelModal';
import styled from 'styled-components/macro';
import AccountCard from '../../../components/Account/Account';
import { AdditionalWarning100 } from '../../../styles/colors';
import { useFee } from '../../../hooks/useFee';
import StagesModal from '../../Token/Modals/StagesModal';
import { useAcceptSponsorshipStages } from '../../../hooks/adminStages/useAcceptSponsorshipStages';
import { useApi } from '../../../hooks/useApi';
import { NFTCollection } from '../../../api/chainApi/unique/types';

const tokenSymbol = 'KSM';

export const AcceptSponsorshipModal: FC<TAdminPanelModalBodyProps> = ({ collection, onClose, setIsClosable, onFinish }) => {
  const { kusamaFee } = useFee();
  const [step, setStep] = useState<'ask' | 'stages'>('ask');
  const { initiate, status, stages } = useAcceptSponsorshipStages(collection?.id || 0);

  const onRefuseClick = useCallback(() => {
    onClose();
  }, []);

  const onConfirmClick = useCallback(() => {
    setIsClosable(false);
    setStep('stages');
    initiate(null);
  }, []);

// TODO: remove this after the API provides complete collection details (cover, sponsorship, etc)
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

  if (step === 'stages') return (<StagesModal stages={stages} status={status} onFinish={onFinish} />);

  return (
    <>
      <Content>
        <Heading size='2'>Accept sponsorship</Heading>
      </Content>
      <Row>
        <Text size={'m'}>{`The author of the collection “${collection?.name || collection?.collectionName}” ID ${collection?.id} has chosen this address as a sponsor. Do you confirm the choice?`}</Text>
      </Row>
      <AddressWrapper>
        {collectionDetails?.sponsorship?.unconfirmed && <AccountCard accountName={''} accountAddress={collectionDetails?.sponsorship?.unconfirmed || ''} canCopy={true} />}
      </AddressWrapper>
      <TextStyled
        color='additional-warning-500'
        size='s'
      >
        {`A fee of ~ ${kusamaFee} ${tokenSymbol} can be applied to the transaction`}
      </TextStyled>
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
    margin-bottom: 0;
  }
`;

const Row = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
`;

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  margin: calc(var(--gap) * 1.5) 0;
  align-items: center;
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
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
  column-gap: var(--gap);
`;
