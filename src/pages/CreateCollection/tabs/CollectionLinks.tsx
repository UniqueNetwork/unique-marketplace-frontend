import { Heading, InputText, Text } from 'components/UI';
import styled from 'styled-components';
import { FormRow } from '../components/FormComponents';
import { Controller, useFormContext } from 'react-hook-form';
import CollectionHeader from '../components/CollectionHeader';

export const CollectionLinks = () => {
  const { watch } = useFormContext();

  const name = watch('name');
  const description = watch('description');

  return (
    <>
      <CollectionHeader name={name} description={description} />
      <Heading size='2'>Links</Heading>
      <Text size='m' color='grey-500' weight='light'>
        Will be visible in the collection page on the marketplace. Can be set or changed later.
      </Text>
      
      <FormRow>
        <Controller
          name='discord'
          rules={{
            pattern: {
              value: /^https?:\/\/(www\.)?discord\.com\/.*/i,
              message: 'Should be a valid Discord link'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SymbolInputText
              label='Discord'
              placeholder='https://'
              value={value}
              error={!!error}
              statusText={error?.message}
              onChange={onChange}
            />
          )}
        />
      </FormRow>

      <FormRow>
        <Controller
          name='website'
          rules={{
            pattern: {
              value: /^https?:\/\/\S+/,
              message: 'Should be a valid website link'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SymbolInputText
              label='Website'
              placeholder='https://'
              value={value}
              error={!!error}
              statusText={error?.message}
              onChange={onChange}
            />
          )}
        />
      </FormRow>

      <FormRow>
        <Controller
          name='twitter/X'
          rules={{
            pattern: {
              value: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.*/i,
              message: 'Should be a valid Twitter link'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SymbolInputText
              label='Twitter'
              placeholder='https://'
              value={value}
              error={!!error}
              statusText={error?.message}
              onChange={onChange}
            />
          )}
        />
      </FormRow>

      <FormRow>
        <Controller
          name='instagram'
          rules={{
            pattern: {
              value: /^https?:\/\/(www\.)?instagram\.com\/.*/i,
              message: 'Should be a valid Instagram link'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SymbolInputText
              label='Instagram'
              placeholder='https://'
              value={value}
              error={!!error}
              statusText={error?.message}
              onChange={onChange}
            />
          )}
        />
      </FormRow>

      <FormRow>
        <Controller
          name='telegram'
          rules={{
            pattern: {
              value: /^https?:\/\/(www\.)?t\.me\/.*/i,
              message: 'Should be a valid Telegram link'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SymbolInputText
              label='Telegram'
              placeholder='https://'
              value={value}
              error={!!error}
              statusText={error?.message}
              onChange={onChange}
            />
          )}
        />
      </FormRow>

      <FormRow>
        <Controller
          name='reddit'
          rules={{
            pattern: {
              value: /^https?:\/\/(www\.)?reddit\.com\/.*/i,
              message: 'Should be a valid Reddit link'
            }
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SymbolInputText
              label='Reddit'
              placeholder='https://'
              value={value}
              error={!!error}
              statusText={error?.message}
              onChange={onChange}
            />
          )}
        />
      </FormRow>
    </>
  );
};

const SymbolInputText = styled(InputText)`
  label {
    font-weight: 500;
    margin-bottom: 16px;
  }
`;
