import styled from 'styled-components';
import { InputText, InputTextProps } from '../InputText/InputText';
import { Text } from '../Text/Text';
import { formatBlockNumber } from 'utils/textUtils';

type InputAmountProps = InputTextProps & {
  maxValue?: number;
};

export const InputAmount = ({ maxValue, ...inputProps }: InputAmountProps) => {
  const onSetMaxValueClick = () => {
    inputProps.onChange?.(String(maxValue || 0));
  };

  return (
    <InputAmountWrapper>
      <InputText
        label={
          <LabelWrapper>
            Number of fractions to be sent
            <Text size='s' color='grey-500'>{`You own: ${formatBlockNumber(
              maxValue || 0
            )}`}</Text>
          </LabelWrapper>
        }
        maxLength={49}
        {...inputProps}
      />
      <MaxIcon onClick={onSetMaxValueClick}>Max</MaxIcon>
    </InputAmountWrapper>
  );
};

const InputAmountWrapper = styled.div`
  position: relative;
  .unique-input-text label {
    height: 48px;
    margin-bottom: var(--prop-gap);
  }
  .unique-input-text div.input-wrapper input {
    padding-right: 56px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--prop-gap) / 4);
`;

const MaxIcon = styled.div`
  position: absolute;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  line-height: 42px;
  color: var(--color-primary-500);
  right: var(--gap);
  top: calc(48px + var(--prop-gap));
`;
