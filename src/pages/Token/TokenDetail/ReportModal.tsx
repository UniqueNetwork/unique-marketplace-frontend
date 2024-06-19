import { useCallback, useMemo, useState } from 'react';

import { TextInput } from 'components/TextInput/TextInput';
import { Heading, Loader, Text, Button, Modal, useNotifications } from 'components/UI';
import { useZendeskRequest } from 'hooks/useZendeskRequest';
import styled from 'styled-components';

interface IReportModalProps {
  isVisible: boolean;
  onClose(): void;
  testid: string;
  collectionId: number;
  tokenId: number;
  tokenPrefix: string;
}

export const ReportModal = ({ isVisible, collectionId, tokenId, tokenPrefix, testid, onClose }: IReportModalProps) => {
  const [reportText, setReportText] = useState('');
  const { report, isLoading } = useZendeskRequest();
  const { error, info } = useNotifications();

  const isValid = useMemo(() => {
    if (!reportText.trim().length) {
      return false;
    }
    if (/^[!@#$%^&*()_+~<>{}?]+$/.test(reportText.trim())) {
      return false;
    }
    return true;
  }, [reportText]);

  const onConfirmReportClick = useCallback(async () => {
    if (!isValid) return;

    try {
      await report({
        collectionId,
        tokenId,
        tokenPrefix,
        message: reportText
      });
      info('Report sent');
      setReportText('');
      onClose();
    } catch (e: any) {
      error(`Error: ${e.message}`);
    }
  }, [collectionId, tokenId, tokenPrefix, reportText, onClose]);

  return <>
    <Modal isVisible={isVisible} onClose={onClose} isClosable >
      <Content>
        <Heading size='2' testid={`${testid}-heading`}>Report this item</Heading>
      </Content>
      <LabelWrapper>
        <Text>Tell us why you reckon this NFT should be taken off the marketplace</Text>
      </LabelWrapper>
      <InputWrapper
        allowSpaces
        placeholder='Details'
        onChange={setReportText}
        value={reportText}
        testid={`${testid}-price-input`}
      />
      <ButtonWrapper>
        <Button
          disabled={!isValid}
          onClick={onConfirmReportClick}
          role='primary'
          title='Report'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
      {isLoading && <LoaderWrapper><Loader /></LoaderWrapper>}
    </Modal>
  </>;
};

const InputWrapper = styled(TextInput)`
  margin-bottom: 32px;
  width: 100%;
`;

const LabelWrapper = styled.div`
  margin: 24px 0;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 568px) {
    button {
      width: 100%;
    }
  }
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.7);
`;
