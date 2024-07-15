import styled from 'styled-components';
import { ConfirmBtn } from 'components';
import React from 'react';

interface ConfirmDeleteFormProps {
  onSubmit: () => void;
  onClose: () => void;
}

const ConfirmDeleteForm: React.FC<ConfirmDeleteFormProps> = ({
  onSubmit,
  onClose,
}) => {
  return (
    <FormWrap>
      <InputLabel>
        Delete attribute?
      </InputLabel>
      <ButtonWrap>
        <ConfirmBtn role='outlined' title={'Cancel'} onClick={onClose} />
        <ConfirmBtn role='primary' title={'Delete'} onClick={onSubmit} />
      </ButtonWrap>
    </FormWrap>
  );
};

export default ConfirmDeleteForm;

export const FormWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ButtonWrap = styled.div`
  display: flex;
  gap: 12px;

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
  widht: 100%;
`;
