import { Heading } from '@unique-nft/ui-kit';

import { Button, Textarea } from 'components/UI';
import { TextInput } from 'components/TextInput/TextInput';
import { Reducer, useCallback, useMemo, useReducer, useState } from 'react';
import { ButtonsRow, FormRow, FormWrapper } from './FormComponents';
import { MarketableCollectionMetadata } from 'api/restApi/collections/types';

interface CollectionEditFormProps {
  initialFormData: Partial<MarketableCollectionMetadata>;
  onSubmit(formData: Partial<MarketableCollectionMetadata>): void;
}

type FormReducer = Reducer<
    Partial<MarketableCollectionMetadata>,
    { field: keyof MarketableCollectionMetadata, value: string }
  >;

export const CollectionEditForm = ({ initialFormData, onSubmit }: CollectionEditFormProps) => {
  const [formValues, onChange] = useReducer<FormReducer>(
    (state, { field, value }) => {
    return { ...state, [field]: value };
  }, initialFormData);
  const { description, website, discord, twitter, telegram, instagram, reddit } = formValues;

  const [errors, setErrors] = useState<Partial<Record<keyof MarketableCollectionMetadata, string>>>({});

  const onChangeValue = useCallback((field: keyof MarketableCollectionMetadata) => (value: string) => {
    if (field === 'description') {
      setErrors((errors) => ({
        ...errors,
        description: value && /^[!@#$%^&*()_+~<>{}?]+$/.test(value) ? 'Invalid description' : undefined }));
    } else {
      setErrors((errors) => ({
        ...errors,
        // eslint-disable-next-line no-useless-escape
        [field]: value && !/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(value) ? 'Invalid URL' : undefined }));
    }
    onChange({ field, value });
  }, [onChange]);

  const onSubmitForm = useCallback(() => {
    onSubmit(formValues);
  }, [onSubmit, formValues]);

  const isValid: boolean = useMemo(() => Object.values(errors).filter((value) => !!value).length === 0, [errors]);

  return <>
    <FormWrapper>
      <Heading size='2' >Main information</Heading>
      <FormRow>
        <Textarea
          label='Description'
          additionalText='Max 256 symbols'
          value={description}
          onChange={onChangeValue('description')}
          rows={3}
          maxLength={256}
          error={!!errors.description}
          statusText={errors.description}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Website'
          placeholder='http://'
          value={website}
          onChange={onChangeValue('website')}
          errorText={errors.website}
        />
      </FormRow>
    </FormWrapper>
    <FormWrapper>
      <Heading size='2' >Social media links</Heading>
      <FormRow>
        <TextInput
          label='Discord'
          placeholder='http://'
          value={discord}
          onChange={onChangeValue('discord')}
          errorText={errors.discord}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Twitter'
          placeholder='http://'
          value={twitter}
          onChange={onChangeValue('twitter')}
          errorText={errors.twitter}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Instagram'
          placeholder='http://'
          value={instagram}
          onChange={onChangeValue('instagram')}
          errorText={errors.instagram}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Telegram'
          placeholder='http://'
          value={telegram}
          onChange={onChangeValue('telegram')}
          errorText={errors.telegram}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Reddit'
          placeholder='http://'
          value={reddit}
          onChange={onChangeValue('reddit')}
          errorText={errors.reddit}
        />
      </FormRow>
      <ButtonsRow>
        <Button title='Save changes' onClick={onSubmitForm} disabled={!isValid}/>
      </ButtonsRow>
    </FormWrapper>
  </>;
};
