import React, { FC, useCallback, useMemo, useState } from 'react';
import { Heading, Modal, useNotifications } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TAccountModalProps, CreateAccountModalStages, TAccountProperties, TCreateAccountBodyModalProps } from './types';
import { useAccounts } from '../../../hooks/useAccounts';
import { AskCredentialsModal } from './AskCredentials';
import { defaultPairType, derivePath } from './CreateAccount';
import { AskExistsSeedPhraseModal } from './AskExistsSeedPhrase';
import { ImportViaSeedFinalModal } from './ImportViaSeedFinal';

export const ImportViaSeedAccountModal: FC<TAccountModalProps> = ({ isVisible, onFinish, onClose }) => {
  const [stage, setStage] = useState<CreateAccountModalStages>(CreateAccountModalStages.AskSeed);
  const [accountProperties, setAccountProperties] = useState<TAccountProperties>();
  const { addLocalAccount } = useAccounts();
  const { error } = useNotifications();

  const ModalBodyComponent = useMemo<FC<TCreateAccountBodyModalProps> | null>(() => {
    switch (stage) {
      case CreateAccountModalStages.AskSeed:
        return AskExistsSeedPhraseModal;
      case CreateAccountModalStages.AskCredentials:
        return AskCredentialsModal;
      case CreateAccountModalStages.Final:
        return ImportViaSeedFinalModal;
      default:
        return null;
    }
  }, [stage]);

  const onStageFinish = useCallback((accountProperties: TAccountProperties) => {
    if (stage === CreateAccountModalStages.Final) {
      if (!accountProperties) return;
      try {
        addLocalAccount(accountProperties.seed, derivePath, accountProperties.name || '', accountProperties.password || '', defaultPairType);
        onFinish();
        setStage(CreateAccountModalStages.AskSeed);
        return;
      } catch (e) {
        error('Specified phrase is not a valid mnemonic. Please type seed phrase corresponding to mnemonic');
        console.log('error', e);
      }
    } else {
      setAccountProperties(accountProperties);
      setStage(stage + 1);
    }
  }, [stage]);

  const onGoBack = useCallback(() => {
    if (stage === CreateAccountModalStages.AskSeed) return;
    setStage(stage - 1);
  }, [stage]);

  if (!ModalBodyComponent) return null;

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onClose}>
    <Content>
      <Heading size='2'>{'Add an account via seed phrase'}</Heading>
    </Content>
    <ModalBodyComponent
      accountProperties={accountProperties}
      onFinish={onStageFinish}
      onGoBack={onGoBack}
    />
  </Modal>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }

  @media (max-width: 567px) {
    && h2 {
      font-size: 24px;
      line-height: 36px;
    }
  }
`;
