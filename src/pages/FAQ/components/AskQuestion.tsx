import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { Button, Icon, Modal, Text, useNotifications, Textarea } from 'components/UI';

import { SidePlateFooter } from './SidePlateFooter';
import { SocialNav } from './SocialNav';
import { AskQuestionRequest, useZendeskRequest } from 'hooks/useZendeskRequest';
import { Heading, Loader } from '@unique-nft/ui-kit';
import { TextInput } from 'components/TextInput/TextInput';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .unique-button {
    width: 100%;
    max-width: 280px;
  }
`;

const socialLinks = {
  telegram: 'https://t.me/Uniquechain',
  twitter: 'https://twitter.com/Unique_NFTchain',
  discord: 'https://discord.gg/jHVdZhsakC',
  github: 'https://github.com/UniqueNetwork',
  subsocial: 'https://app.subsocial.network/@uniquenetwork-nft'
};

const formErrors = {
  required: 'You did not fill in the required fields',
  nameIncorrect: 'Name is incorrect',
  emailIncorrect: 'Email is not correct',
  questionIncorrect: 'Question is not correct'
};

export const AskQuestion = () => {
  const [visibleModal, setVisibleModal] = useState(false);

  const size = useDeviceSize();
  const [formState, setFormState] = useState<Partial<AskQuestionRequest>>({});

  const { info, error } = useNotifications();
  const { askQuestion, isLoading } = useZendeskRequest();

  const [validationState, setValidationState] = useState<Partial<Record<keyof AskQuestionRequest, string>>>({});

  const onChangeName = useCallback((value: string) => {
    if (value.length > 200) return;
    const form = { ...formState, name: value };
    setValidationState((state) => ({
      ...(state || {}),
      name: validateField(value, (v) => /^[!@#$%^&*()_+~<>{}?]+$/.test(v), formErrors.nameIncorrect)
    }));
    setFormState(form);
  }, [formState]);

  const onChangeEmail = useCallback((value: string) => {
    if (value.length > 100) return;
    const form = { ...formState, email: value };
    setValidationState((state) => ({
      ...(state || {}),
      email: validateField(value, (value) => !emailValidationRegExp.test(value), formErrors.emailIncorrect)
    }));
    setFormState(form);
  }, [formState]);

  const onChangeQuestion = useCallback((value: string) => {
    const form = { ...formState, question: value };
    setValidationState((state) => ({
      ...(state || {}),
      question: validateField(value, (v) => /^[!@#$%^&*()_+~<>{}?]+$/.test(v), formErrors.questionIncorrect)
    }));
    setFormState(form);
  }, [formState]);

  const onSubmit = useCallback(async () => {
    const { name, email, question } = formState;
    try {
      await askQuestion({
        name: name || '',
        email: email || '',
        question: question || ''
      });

      setVisibleModal(false);
      info('Your request has been accepted');
    } catch {
      error('An unexpected error has occurred. Please repeat your question');
    }
  }, [formState]);

  useEffect(() => {
    setFormState({});
    setValidationState({});
  }, [visibleModal]);

  const isValid = useMemo(() => (formState.name && formState.email && formState.question) &&
    !(validationState?.name || validationState?.email || validationState?.question), [formState, validationState]);

  return (
    <Wrapper>
      <Heading size='3'>Didn&apos;t find the answer? Write&nbsp;to&nbsp;us.</Heading>
      <Button
        title='Ask a question'
        onClick={() => {
          setVisibleModal(true);
        }}
      />
      <SidePlateFooter>
        <Text>You can also find information in our community</Text>
        <SocialNav>
          <a href={socialLinks.telegram} target='_blank' rel='noreferrer noopener'>
            <Icon name='social-telegram' color='currentColor' size={32} />
          </a>
          <a href={socialLinks.twitter} target='_blank' rel='noreferrer noopener'>
            <Icon name='social-twitter' color='currentColor' size={32} />
          </a>
          <a href={socialLinks.discord} target='_blank' rel='noreferrer noopener'>
            <Icon name='social-discord' color='currentColor' size={32} />
          </a>
          <a href={socialLinks.github} target='_blank' rel='noreferrer noopener'>
            <Icon name='social-github' color='currentColor' size={32} />
          </a>
          <a
            href={socialLinks.subsocial}
            target='_blank'
            rel='noreferrer noopener'
          >
            <Icon name='social-subsocial' color='var(--color-primary-500)' size={32} />
          </a>
        </SocialNav>
      </SidePlateFooter>
      <Modal
        isClosable
        isVisible={visibleModal}
        onClose={() => {
          setVisibleModal(false);
        }}
      >
        <Heading size='2'>Ask a question</Heading>
        {isLoading && <Loader isFullPage={true} />}
        <ModalContent>
          <TextInput
            label='Name *'
            value={formState.name}
            onChange={onChangeName}
            errorText={validationState?.name}
          />
          <TextInput
            label='Email *'
            value={formState.email}
            onChange={onChangeEmail}
            errorText={validationState?.email}
          />
          <Textarea
            label='Question *'
            value={formState.question}
            rows={6}
            maxLength={1000}
            onChange={onChangeQuestion}
            statusText={validationState?.question}
            error={!!validationState?.question}
          />
          <ConfirmWrapper>
            <Button
              title='Send'
              role='primary'
              type='submit'
              disabled={!isValid}
              wide={size === DeviceSize.sm}
              onClick={onSubmit}
            />
          </ConfirmWrapper>
        </ModalContent>
      </Modal>
    </Wrapper>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  .unique-input-text,
  .unique-textarea-text {
    width: unset;
    margin-bottom: 30px;
    label {
      text-align: start;
      margin-bottom: 15px;
      font-weight: 500;
    }
    .status-text {
      text-align: start;
    }
  }
`;

const ConfirmWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  button.unique-button {
    min-width: 88px;
    @media screen and (max-width: 568px) {
      min-width: 88px;
    }
  }
`;

const emailValidationRegExp =
  // eslint-disable-next-line no-control-regex
  /^(?:[a-z0-9]+([a-z0-9_\-.]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

const validateField = (value: string | undefined, test: (value: string) => boolean, errorText: string) => {
  if (!value?.trim()) {
    return formErrors.required;
  }

  if (test(value.trim())) {
    return errorText;
  }
  return undefined;
};
