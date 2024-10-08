import React, { VFC } from 'react';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';

import { InputText, Textarea, Heading } from 'components/UI';
import { Form, FormBody, FormHeader, FormRow } from '../components/FormComponents';
import { MAX_DESCRIPTION_SIZE, MAX_NAME_SIZE, MAX_SYMBOL_BYTES_SIZE, MAX_SYMBOL_SIZE, _10MB } from 'pages/CreateNFT/constants';
import { FORM_ERRORS } from '../constants';

interface MainInformationProps {
  className?: string;
}

const MainInformationComponent: VFC<MainInformationProps> = ({ className }) => {
  return (
    <>
      <FormHeader>
        <Heading size='2'>Immutable collection information</Heading>
      </FormHeader>
      <FormBody>
        <Form className={className}>
          <FormRow>
            <Controller
              name='name'
              rules={{
                required: {
                  value: true,
                  message: FORM_ERRORS.REQUIRED_FIELDS
                },
                pattern: {
                  value: /^\S+.*/,
                  message: 'Name is not correct'
                }
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <InputText
                  label='Collection name *'
                  value={value}
                  maxLength={MAX_NAME_SIZE}
                  additionalText={`Max ${MAX_NAME_SIZE} symbols (${
                    MAX_NAME_SIZE - value.length
                  } left)`}
                  error={!!error}
                  statusText={error?.message}
                  onChange={onChange}
                />
              )}
            />
          </FormRow>
          <FormRow>
            <Controller
              name='symbol'
              rules={{
                required: {
                  value: true,
                  message: FORM_ERRORS.REQUIRED_FIELDS
                },
                pattern: {
                  value: /^\S+/,
                  message: 'Symbol is not correct'
                }
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <SymbolInputText
                  label='Symbol*'
                  value={value}
                  maxLength={MAX_SYMBOL_SIZE}
                  additionalText={
                    <>
                      Can be used as an NFT name by some wallets. 
                      Max symbols {MAX_SYMBOL_SIZE} ({MAX_SYMBOL_SIZE - value.length}{' '}
                      left)
                    </>
                  }
                  error={!!error}
                  statusText={error?.message}
                  onChange={(newVal) => {
                    const size = new Blob([newVal]).size;

                    if (size <= MAX_SYMBOL_BYTES_SIZE) {
                      onChange(newVal);
                    }
                  }}
                />
              )}
            />
          </FormRow>

          <FormRow>
            <Controller
              name='description'
              render={({ field: { onChange, value } }) => (
                <Textarea
                  label='Description'
                  value={value}
                  rows={4}
                  maxLength={MAX_DESCRIPTION_SIZE}
                  additionalText={`Max ${MAX_DESCRIPTION_SIZE} symbols (${
                    MAX_DESCRIPTION_SIZE - value.length
                  } left)`}
                  onChange={onChange}
                />
              )}
            />
          </FormRow>
        </Form>
      </FormBody>
    </>
  );
};

const SymbolInputText = styled(InputText)`
  div.additional-text {
    height: auto;
  }
`;

export const MainInformation = styled(MainInformationComponent)`
  .upload-container {
    position: relative;
    max-width: fit-content;
  }
`;
