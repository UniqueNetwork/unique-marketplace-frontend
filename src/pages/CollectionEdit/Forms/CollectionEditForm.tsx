import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';
import { Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { Button, Textarea } from 'components/UI';
import { TextInput } from 'components/TextInput/TextInput';
import { CollectionFormData } from '../types';
import { Reducer, useCallback, useReducer, useState } from 'react';
import { ButtonsRow, FormRow, FormWrapper } from './FormComponents';

interface CollectionEditFormProps {
  initialFormData: Partial<CollectionFormData>;
  onSubmit(formData: Partial<CollectionFormData>): void;
}

type FormReducer = Reducer<
    Partial<CollectionFormData>,
    { field: keyof CollectionFormData, value: string }
  >;

export const CollectionEditForm = ({ initialFormData, onSubmit }: CollectionEditFormProps) => {
  const [formValues, onChange] = useReducer<FormReducer>(
    (state, { field, value }) => {
    return { ...state, [field]: value };
  }, initialFormData);
  const { description, website, discord, twitter, telegram, instagram, reddit } = formValues;

  const onChangeValue = useCallback((field: keyof CollectionFormData) => (value: string) => {
    onChange({ field, value });
  }, [onChange]);

  const onSubmitForm = useCallback(() => {
    onSubmit(formValues);
  }, [onSubmit, formValues]);

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
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Website'
          placeholder='http://'
          value={website}
          onChange={onChangeValue('website')}
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
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Twitter'
          placeholder='http://'
          value={twitter}
          onChange={onChangeValue('twitter')}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Instagram'
          placeholder='http://'
          value={instagram}
          onChange={onChangeValue('instagram')}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Telegram'
          placeholder='http://'
          value={telegram}
          onChange={onChangeValue('telegram')}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label='Reddit'
          placeholder='http://'
          value={reddit}
          onChange={onChangeValue('reddit')}
        />
      </FormRow>
      <ButtonsRow>
        <Button title='Save changes' onClick={onSubmitForm}/>
      </ButtonsRow>
    </FormWrapper>
  </>;
};
