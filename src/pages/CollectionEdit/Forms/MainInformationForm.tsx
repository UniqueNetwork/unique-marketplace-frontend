import { Heading, Button, Textarea } from 'components/UI';
import { Reducer, useCallback, useMemo, useReducer, useState } from 'react';
import { ButtonsRow, FormRow, FormWrapper } from './FormComponents';
import { MarketableCollectionMetadata } from 'api/restApi/collections/types';

interface MainInformationFormProps {
  initialFormData: Partial<MarketableCollectionMetadata>;
  onSubmit(formData: Partial<MarketableCollectionMetadata>): void;
  isCoverChanged?: boolean;
}

type FormReducer = Reducer<
  Partial<MarketableCollectionMetadata>,
  { field: 'description'; value: string }
>;

export const MainInformationForm = ({
  initialFormData,
  onSubmit,
  isCoverChanged,
}: MainInformationFormProps) => {
  const [formValues, onChange] = useReducer<FormReducer>(
    (state, { field, value }) => {
      return { ...state, [field]: value };
    },
    { description: initialFormData.description }
  );
  const { description } = formValues;

  const [errors, setErrors] = useState<Partial<Record<'description', string>>>(
    {}
  );

  const onChangeValue = useCallback(
    (value: string) => {
      setErrors((errors) => ({
        ...errors,
        description:
          value && /^[!@#$%^&*()_+~<>{}?]+$/.test(value)
            ? 'Invalid description'
            : undefined,
      }));
      onChange({ field: 'description', value });
    },
    [onChange]
  );

  const onSubmitForm = useCallback(() => {
    onSubmit(formValues);
  }, [onSubmit, formValues]);

  const isValid: boolean = useMemo(
    () => Object.values(errors).filter((value) => !!value).length === 0,
    [errors]
  );

  const isChanged = useMemo(() => {
    return (
      (formValues.description || '') !==
      (initialFormData.description || '')
    );
  }, [initialFormData, formValues]);

  return (
    <FormWrapper>
      <Heading size="2">Main Information</Heading>
      <FormRow>
        <Textarea
          label="Description"
          additionalText="Max 256 symbols"
          value={description}
          onChange={onChangeValue}
          rows={3}
          maxLength={256}
          error={!!errors.description}
          statusText={errors.description}
        />
      </FormRow>
      <ButtonsRow>
        <Button
          title="Save changes"
          onClick={onSubmitForm}
          disabled={!(isValid && (isCoverChanged || isChanged))}
        />
      </ButtonsRow>
    </FormWrapper>
  );
};
