import { VFC, useMemo, memo } from 'react';
import { Controller } from 'react-hook-form';

import { AttributeOption, AttributeType } from './types';
import { FormRow } from 'pages/CollectionEdit/Forms/FormComponents';
import { LabelText } from './components/AttributesForm';
import { InputText, Select } from 'components/UI';
import { FORM_ERRORS } from 'pages/CreateCollection/constants';

interface AttributesRowProps {
  name: string;
  label?: string;
  required?: boolean;
  type: AttributeType;
  values: Array<number | string | undefined>;
}

const AttributesRowComponent: VFC<AttributesRowProps> = ({
  type,
  values,
  label,
  required,
  name
}) => {
  const options = useMemo(
    () => values.map((val, index) => ({ id: index, title: val })),
    []
  );

  return (
    <FormRow>
      <LabelText>
        {label}
        {required && '*'}
      </LabelText>
      {type === 'text' && (
        <Controller
          name={name}
          rules={{
            required: {
              value: !!required,
              message: FORM_ERRORS.REQUIRED_FIELDS
            },
            pattern: {
              value: /^\S+.*/,
              message: 'Value is not correct'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <InputText
              value={value}
              error={!!error}
              onChange={onChange}
            />
          )}
        />
      )}
      {type === 'select' && (
        <Controller
          name={name}
          rules={{
            required: {
              value: !!required,
              message: FORM_ERRORS.REQUIRED_FIELDS
            }
          }}
          render={({ field: { onChange, value } }) => (
            <Select value={value?.id} options={options} onChange={onChange} />
          )}
        />
      )}
      {type === 'multiselect' && (
        <Controller
          name={name}
          rules={{
            required: {
              value: !!required,
              message: FORM_ERRORS.REQUIRED_FIELDS
            }
          }}
          render={({ field: { onChange, value } }) => (
            <Select
              multi
              values={value?.map((val: AttributeOption) => val.id)}
              options={options}
              onChange={onChange}
            />
          )}
        />
      )}
    </FormRow>
  );
};

export const AttributesRow = memo(AttributesRowComponent);
