import styled from 'styled-components';
import { useMemo } from 'react';

import { Attribute, AttributeOption } from '../types';
import { Icon, InputText, Select, Text, TooltipWrapper, Heading } from 'components/UI';
import { PotentialAttribute } from '@unique-nft/sdk';
import { SelectOptionProps } from 'components/UI/types';

type AttributesFormProps = {
  isValid?: boolean;
  initialAttributes: Attribute[];
  attributes: Attribute[];
  attributesSchema: PotentialAttribute[];
  onChange(attributes: Attribute[]): void;
};

export const AttributesForm = ({
  initialAttributes,
  attributes,
  attributesSchema,
  isValid,
  onChange
}: AttributesFormProps) => {
  const onChangeAttribute = (index: number) => (value: Attribute) => {
    if (attributes.length < Object.values(attributesSchema).length) {
      attributes = Array.from({ length: Object.values(attributesSchema).length });
    }
    onChange([...attributes.slice(0, index), value, ...attributes.slice(index + 1)]);
  };

  return (
    <>
      <Heading size='4'>Attributes</Heading>
      {attributesSchema.length === 0 && (
        <Text size='s' color='grey-500'>
          There are no attributes
        </Text>
      )}
      {attributesSchema.length > 0 && (
        <>
          {attributesSchema.map(({ trait_type, values }, index) => {
            return (
              <AttributeRow
                key={`${trait_type}_${index}`}
                label={trait_type}
                required={false}
                isArray={!!values}
                enumValues={values}
                initialValue={initialAttributes[index]}
                value={attributes[index]}
                isValid={isValid}
                onChange={onChangeAttribute(index)}
              />
            );
          })}
        </>
      )}
    </>
  );
};

const AttributesWrapper = styled.div`
  display: block;
  height: 100%;
  background-color: white;
  flex: 1;

  @media screen and (max-width: 568px) {
    padding-bottom: var(--prop-gap);
  }
`;

interface AttributeRowProps {
  label?: string;
  required?: boolean;
  isArray?: boolean;
  enumValues?: (string | number)[] | undefined;
  initialValue: Attribute;
  value: Attribute;
  isValid?: boolean;
  onChange(value: Attribute): void;
}

const AttributeRow = ({
  label,
  required,
  isArray,
  initialValue,
  enumValues,
  value,
  isValid,
  onChange
}: AttributeRowProps) => {
  const options = useMemo(
    () =>
    (enumValues || []).map((val, index) => ({
        id: index.toString(),
        title: val.toString()
      })) || [],
    [enumValues]
  );

  const onSelect = (value: SelectOptionProps | SelectOptionProps[]) => {
    if (Array.isArray(value)) {
      onChange(value as AttributeOption[]);
      return;
    }
    onChange(value as AttributeOption);
  };

  return (
    <>
      <LabelText>
        {label}
        {required && '*'}
        {(initialValue as { hasDifferentValues: boolean })?.hasDifferentValues && (
          <TooltipWrapper
            message={
              "Some of the tokens you've selected already possess varying attribute values. You can either select a different set of tokens or modify the attribute value for the current selection."
            }
          >
            <Icon size={24} name='warning' color='var(--color-primary-500)' />
          </TooltipWrapper>
        )}
      </LabelText>

      {options.length > 0 && (
        <Select
          multi={isArray}
          optionKey='id'
          {...(isArray && !(value as { hasDifferentValues: boolean })?.hasDifferentValues
            ? {
                values: (value as AttributeOption[])?.map<string>(({ id }) =>
                  id.toString()
                )
              }
            : {
                value: (value as AttributeOption)?.id?.toString()
              })}
          options={options}
          error={!isValid && required}
          onChange={onSelect}
        />
      )}
      {options.length === 0 && (
        <InputText
          value={
            (value as { hasDifferentValues: boolean })?.hasDifferentValues
              ? ''
              : (value as string)
          }
          error={!isValid && required}
          onChange={onChange}
        />
      )}
    </>
  );
};

export const LabelText = styled(Text).attrs({
  color: 'additional-dark',
  size: 'm'
})`
  display: flex !important;
  margin-bottom: var(--prop-gap);
  font-weight: 600;
  align-items: center;
  gap: 8px;
  svg {
    min-width: 24px;
  }
`;
