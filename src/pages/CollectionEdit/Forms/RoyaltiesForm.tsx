import { Reducer, useCallback, useEffect, useReducer } from 'react';
import { Heading } from '@unique-nft/ui-kit';

import { Button, RadioGroup } from 'components/UI';
import { RoyaltiesFormData } from '../types';
import { NumberInput } from 'components/NumberInput/NumberInput';
import { ButtonsRow, FormRow, FormWrapper, RadioLabel } from './FormComponents';
import { RadioOptionValueType } from 'components/UI/RadioGroup/RadioGroup';
import IconWithHint from 'components/IconWithHint/IconWithHint';

interface RoyaltiesFormProps {
  initialFormData?: Partial<RoyaltiesFormData>;
  onSubmit(formData: Partial<RoyaltiesFormData>): void;
}

type FormReducer = Reducer<
    Partial<RoyaltiesFormData>,
    { field: keyof RoyaltiesFormData, value: string }
  >;

const RoyaltiesTypeOptions: RadioOptionValueType[] = [
  {
    value: 'immutable',
    label: <RadioLabel label='Immutable Royalties' tooltip='Royalties can`t be changed' />
  },
  {
    value: 'flexible',
    label: <RadioLabel label='Flexible Royalties' tooltip='Royalties can be changed' />
  }
];

export const RoyaltiesForm = ({ initialFormData, onSubmit }: RoyaltiesFormProps) => {
  const [formValues, onChange] = useReducer<FormReducer>(
    (state, { field, value }) => {
    return { ...state, [field]: value };
  }, {});
  const { royaltiesType, royaltiesPercentage } = formValues;

  useEffect(() => {
    onChange({ field: 'royaltiesPercentage', value: initialFormData?.royaltiesPercentage || '' });
    onChange({ field: 'royaltiesType', value: initialFormData?.royaltiesType || 'immutable' });
  }, [initialFormData]);

  const onChangeValue = useCallback((field: keyof RoyaltiesFormData) => (value: string) => {
    onChange({ field, value });
  }, [onChange]);

  const onSubmitForm = useCallback(() => {
    onSubmit(formValues);
  }, [onSubmit, formValues]);

  return <FormWrapper>
    <Heading size='2' >Royalties</Heading>
    <FormRow>
      <RadioGroup
        label='Royalties type'
        additionalText='Be aware that if you choose Immutable royalties, you can`t enable Flexible royalties anymore.'
        value={royaltiesType}
        options={RoyaltiesTypeOptions}
        onChange={({ value }) => onChangeValue('royaltiesType')(value)}
      />
    </FormRow>
    <FormRow>
      <NumberInput
        label='Royalties percentage'
        additionalText='Token name as displayed in Wallet (max 4 symbols).'
        placeholder='%'
        value={royaltiesPercentage}
        onChange={onChangeValue('royaltiesPercentage')}
      />
    </FormRow>
    <ButtonsRow>
      <Button title='Save changes' onClick={onSubmitForm} />
    </ButtonsRow>
  </FormWrapper>;
};
