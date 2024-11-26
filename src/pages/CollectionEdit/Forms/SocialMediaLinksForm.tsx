import { Heading, Button } from 'components/UI';
import { TextInput } from 'components/TextInput/TextInput';
import { Reducer, useCallback, useMemo, useReducer, useState } from 'react';
import { ButtonsRow, FormRow, FormWrapper } from './FormComponents';
import { MarketableCollectionMetadata } from 'api/restApi/collections/types';

interface SocialMediaLinksFormProps {
  initialFormData: Partial<MarketableCollectionMetadata>;
  onSubmit(formData: Partial<MarketableCollectionMetadata>): void;
}

type SocialMediaFields =
  | 'website'
  | 'discord'
  | 'twitter'
  | 'instagram'
  | 'telegram'
  | 'reddit';

type FormReducer = Reducer<
  Partial<MarketableCollectionMetadata>,
  { field: SocialMediaFields; value: string }
>;

export const SocialMediaLinksForm = ({
  initialFormData,
  onSubmit,
}: SocialMediaLinksFormProps) => {
  const [formValues, onChange] = useReducer<FormReducer>(
    (state, { field, value }) => {
      return { ...state, [field]: value };
    },
    {
      website: initialFormData.website,
      discord: initialFormData.discord,
      twitter: initialFormData.twitter,
      instagram: initialFormData.instagram,
      telegram: initialFormData.telegram,
      reddit: initialFormData.reddit,
    }
  );

  const { website, discord, twitter, instagram, telegram, reddit } = formValues;

  const [errors, setErrors] = useState<
    Partial<Record<SocialMediaFields, string>>
  >({});

  const onChangeValue = useCallback(
    (field: SocialMediaFields) => (value: string) => {
      let error;
      if (field === 'telegram') {
        error =
          value &&
          !/(https?:\/\/)?(www[.])?(telegram|t)\.me\/([a-zA-Z0-9_-]*)\/?$/.test(
            value
          )
            ? 'Invalid telegram link'
            : undefined;
      } else {
        error =
          value &&
          !/^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
            value
          )
            ? 'Invalid URL'
            : undefined;
      }
      setErrors((errors) => ({
        ...errors,
        [field]: error,
      }));
      onChange({ field, value });
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
    return Object.keys(formValues).some(
      (field: string) =>
        (formValues[field as SocialMediaFields] || '') !==
        (initialFormData[field as SocialMediaFields] || '')
    );
  }, [initialFormData, formValues]);

  return (
    <FormWrapper>
      <Heading size="2">Social Media Links</Heading>
      <FormRow>
        <TextInput
          label="Website"
          placeholder="https://"
          value={website}
          onChange={onChangeValue('website')}
          errorText={errors.website}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label="Discord"
          placeholder="https://"
          value={discord}
          onChange={onChangeValue('discord')}
          errorText={errors.discord}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label="Twitter"
          placeholder="https://"
          value={twitter}
          onChange={onChangeValue('twitter')}
          errorText={errors.twitter}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label="Instagram"
          placeholder="https://"
          value={instagram}
          onChange={onChangeValue('instagram')}
          errorText={errors.instagram}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label="Telegram"
          placeholder="https://"
          value={telegram}
          onChange={onChangeValue('telegram')}
          errorText={errors.telegram}
        />
      </FormRow>
      <FormRow>
        <TextInput
          label="Reddit"
          placeholder="https://"
          value={reddit}
          onChange={onChangeValue('reddit')}
          errorText={errors.reddit}
        />
      </FormRow>
      <ButtonsRow>
        <Button
          title="Save changes"
          onClick={onSubmitForm}
          disabled={!(isValid && isChanged)}
        />
      </ButtonsRow>
    </FormWrapper>
  );
};
