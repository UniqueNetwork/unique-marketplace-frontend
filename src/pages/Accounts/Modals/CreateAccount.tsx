import React, { FC, useCallback, useMemo, useState } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TAccountModalProps, CreateAccountModalStages, TAccountProperties, TCreateAccountBodyModalProps } from './types';
import { useAccounts } from 'hooks/useAccounts';
import { FinalModal } from './Final';
import { AskCredentialsModal } from './AskCredentials';
import { AskSeedPhraseModal } from './AskSeedPhrase';
import { Modal, useNotifications } from 'components/UI';

export const derivePath = '';

export const defaultPairType = 'sr25519';

export const CreateAccountModal: FC<TAccountModalProps> = ({ isVisible, onFinish, onClose, testid }) => {
  const [stage, setStage] = useState<CreateAccountModalStages>(CreateAccountModalStages.AskSeed);
  const [accountProperties, setAccountProperties] = useState<TAccountProperties>();
  const { addLocalAccount } = useAccounts();
  const { info } = useNotifications();

  const ModalBodyComponent = useMemo<FC<TCreateAccountBodyModalProps> | null>(() => {
    switch (stage) {
      case CreateAccountModalStages.AskSeed:
        return AskSeedPhraseModal;
      case CreateAccountModalStages.AskCredentials:
        return AskCredentialsModal;
      case CreateAccountModalStages.Final:
        return FinalModal;
      default:
        return null;
    }
  }, [stage]);

  const onStageFinish = useCallback((accountProperties: TAccountProperties) => {
    if (stage === CreateAccountModalStages.Final) {
      if (!accountProperties) return;
      addLocalAccount(accountProperties.seed, derivePath, accountProperties.name || '', accountProperties.password || '', defaultPairType);
      onFinish();
      setStage(CreateAccountModalStages.AskSeed);
      info(`Account ${accountProperties.name} successfully created`);
      return;
    }
    setAccountProperties(accountProperties);
    setStage(stage + 1);
  }, [stage]);

  const onGoBack = useCallback(() => {
    if (stage === CreateAccountModalStages.AskSeed) return;
    setStage(stage - 1);
  }, [stage]);

  const onCloseModal = useCallback(() => {
    setAccountProperties(undefined);
    setStage(CreateAccountModalStages.AskSeed);
    onClose();
  }, [isVisible]);

  if (!ModalBodyComponent) return null;

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onCloseModal}>
    <Content>
      <Heading size='2' testid={`${testid}-heading`}>Create substrate account</Heading>
    </Content>
    <ModalBodyComponent
      accountProperties={accountProperties}
      onFinish={onStageFinish}
      onGoBack={onGoBack}
      testid={`${testid}-${stage}`}
    />
  </Modal>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;
