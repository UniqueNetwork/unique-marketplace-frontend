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
  onClose: () => void;
  onlyNumber?: boolean;
}

const TokenInputForm: React.FC<TokenInputFormProps> = ({
  modalType,
  buttonText,
  onSubmit,
  onClose,
  onlyNumber = false,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateInput = (value: string): string => {
    if (value.length < 1 || value.length > 2000) {
      return 'Input must be between 1 and 2000 characters.';
    }

    if (onlyNumber && isNaN(Number(value))) {
      return 'Input must be a number.';
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

const handleInputChange = (value: string): void => {
  if (onlyNumber) {
    let numericValue = value.replace(/[^0-9.]/g, '');
    
    const dotCount = (numericValue.match(/\./g) || []).length;
    if (dotCount > 1) {
      const firstDotIndex = numericValue.indexOf('.');
      numericValue = numericValue.slice(0, firstDotIndex + 1) + 
                     numericValue.slice(firstDotIndex + 1).replace(/\./g, '');
    }
    
    setInputValue(numericValue);
  } else {
    setInputValue(value);
  }
};

  return (
    <FormWrap>
      <InputLabel>
        {
          (modalType === SetForAllModalType.NAME && 'Set all') ||
          (modalType === SetForAllModalType.DESCRIPTION && 'Set all') ||
          (modalType === SetForAllModalType.EXTERNAL_LINK && 'Set all') ||
          (modalType === SetForAllModalType.NEW_ATTRIBUTE && 'New attribute') ||
          ''
        }
      </InputLabel>
      <TextInput
        value={inputValue}
        onChange={handleInputChange}
        errorText={error}
        allowSpaces={!onlyNumber}
      />
      <ButtonWrap>
        <ConfirmBtn role="outlined" title="Cancel" onClick={onClose} />
        <ConfirmBtn role="primary" title={buttonText || 'Set'} onClick={handleSubmit} />
      </ButtonWrap>
    </FormWrap>
  );
};

export default TokenInputForm;

export const FormWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ButtonWrap = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;

  button {
    flex: 1;
  }
`;

export const InputLabel = styled.div`
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  text-align: center;
  width: 100%;
`;
