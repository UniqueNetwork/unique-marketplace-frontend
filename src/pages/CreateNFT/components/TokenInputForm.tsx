import styled from 'styled-components';
import { ConfirmBtn } from 'components';
import { TextInput } from 'components/TextInput/TextInput';
import React, { useState } from 'react';
import { SetForAllModalType } from './TokenList';
import { validateLink } from 'utils/textUtils';

interface TokenInputFormProps {
  modalType: SetForAllModalType | null;
  onSubmit: (inputValue: string, modalType: SetForAllModalType | null) => void;
  buttonText?: string;
}

const TokenInputForm: React.FC<TokenInputFormProps> = ({
  modalType,
  buttonText,
  onSubmit
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateInput = (value: string): string => {
    if (value.length < 3 || value.length > 300) {
      return 'Input must be between 3 and 300 characters.';
    }

    if (modalType === SetForAllModalType.EXTERNAL_LINK) {
      if (!validateLink(value)) {
        return 'Invalid URL format.';
      }
    }

    return '';
  };

  const handleSubmit = (): void => {
    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
    } else {
      setError('');
      onSubmit(inputValue, modalType);
    }
  };

  return (
    <FormWrap>
      <TextInput
        label={
          (modalType === SetForAllModalType.NAME && 'Name') ||
          (modalType === SetForAllModalType.DESCRIPTION && 'Description') ||
          (modalType === SetForAllModalType.EXTERNAL_LINK && 'External link') ||
          (modalType === SetForAllModalType.NEW_ATTRIBUTE && 'New attribute') ||
          ''
        }
        value={inputValue}
        onChange={setInputValue}
        errorText={error}
        allowSpaces={true}
      />
      <ConfirmBtn role='outlined' title={buttonText || 'Set for All'} onClick={handleSubmit} />
    </FormWrap>
  );
};

export default TokenInputForm;

export const FormWrap = styled.div`
  min-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
