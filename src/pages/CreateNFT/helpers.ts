import { PotentialAttribute, AttributeSchemaDto, CreateTokenBody, Attribute as UniqueAttribute, TokenV2ItemForMultipleDto, CreateTokenPayload, TokenProperty } from '@unique-nft/sdk';

import { Attribute, AttributeOption, AttributesForFilter, NewToken } from './types';

const attributeMapper = (attribute?: Attribute) => {
  if (
    attribute === '' ||
    attribute === null ||
    attribute === undefined ||
    (Array.isArray(attribute) && !attribute?.length)
  ) {
    return null;
  }

  if (Array.isArray(attribute)) {
    return attribute.map((attr: AttributeOption) => Number(attr.id));
  }

  if (typeof attribute === 'string') {
    return { _: attribute };
  }

  if (typeof attribute === 'object') {
    // @ts-ignore
    return Number((attribute as AttributeOption).id);
  }

  return attribute;
};

export const mapTokensToPayload = (
  tokens: NewToken[],
  schema?: PotentialAttribute[]
): TokenV2ItemForMultipleDto[] => {
  return tokens.map((token) => mapNewToken(token, schema));
};

export const mapNewToken = (
  token: NewToken,
  schema?: PotentialAttribute[]
): TokenV2ItemForMultipleDto => {
  const mappedTokenDto: TokenV2ItemForMultipleDto = {
    image: token.ipfsCid?.fullUrl, 
    attributes: [],
    royalties: token.royalties?.map(({value, ...rest}) => ({...rest, percent: +value}))
  };

  if (schema && token.attributes?.length) {
    mappedTokenDto.attributes = token.attributes.reduce<UniqueAttribute[]>(
      (acc, attr, index) => {
        if (!schema[index]?.trait_type) return acc;
        if (Array.isArray(attr)) {
          acc.push(...attr.map(({ title }: AttributeOption) => ({
            trait_type: schema[index].trait_type!,
            value: title
          })));
        }
        if (typeof attr === 'string') {
          acc.push({
            trait_type: schema[index].trait_type!,
            value: attr as string
          });
        }
        return acc;
      },
      []
    );
  }

  return mappedTokenDto;
};

export const mapTokensToPayloadV1 = (
  tokens: NewToken[],
  properties: TokenProperty[]
): CreateTokenPayload[] => {
  const propertiesIsArrayMap = new Map();
  properties.forEach((property, index) => {
    try {
      const decodedValue = JSON.parse(property.value);
      const isArray = decodedValue?.isArray;
      propertiesIsArrayMap.set(index, isArray);
    } catch (error) {
      propertiesIsArrayMap.set(index, false);
    }
  });
  //check the value is SELECT not MULTISELECT
  tokens.forEach((token) => {
    const tokenAttributes = token.attributes;
    tokenAttributes.forEach((el, key) => {
      const isArray = propertiesIsArrayMap.get(key);
      if (!isArray && Array.isArray(el)) {
        token.attributes[key] = el[0];
      }
    });
  });

  return tokens.map((token) => mapNewTokenV1(token));
};

export const mapNewTokenV1 = (token: NewToken): CreateTokenPayload => {
  const mappedTokenDto: CreateTokenPayload = {
    data: {
      image: {
        ipfsCid: token.ipfsCid?.cid
      },
      encodedAttributes: {}
    }
  };

  if (mappedTokenDto.data && token.attributes?.length) {
    mappedTokenDto.data.encodedAttributes = token.attributes.reduce(
      (acc, attr, index) => {
        const mapped = attributeMapper(attr);
        if (mapped === null) {
          return acc;
        }

        return {
          ...acc,
          [index]: mapped
        };
      },
      {}
    );
  }

  return mappedTokenDto;
};

export const mapNewToken$1 = (
  token: NewToken,
  collectionId: number,
  owner: string
): CreateTokenBody => {
  const mappedTokenDto: CreateTokenBody = {
    data: {
      image: {
        ipfsCid: token.ipfsCid?.cid
      },
      encodedAttributes: {}
    },
    address: owner,
    collectionId
  };

  if (mappedTokenDto.data && token.attributes?.length) {
    mappedTokenDto.data.encodedAttributes = token.attributes.reduce(
      (acc, attr, index) => {
        const mapped = attributeMapper(attr);
        if (mapped === null) {
          return acc;
        }

        return {
          ...acc,
          [index]: mapped
        };
      },
      {}
    );
  }

  return mappedTokenDto;
};

export const checkRequiredAttributes = (
  tokens: NewToken[],
  attributeSchema?: Record<number, AttributeSchemaDto>
) => {
  if (!attributeSchema) {
    return;
  }

  return tokens.find(({ attributes }) => {
    return Object.values(attributeSchema).some(
      ({ optional }, index) => !optional && !attributes[index]
    );
  });
};

export const scrollToTokenCard = (id: number) => {
  const element = document.getElementById(`token-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

export const getAttributesFromTokens = (
  attributesSchema: PotentialAttribute[],
  tokens: NewToken[]
) => {
  // attributes formatted for Filter component
  const attributesForFilter: AttributesForFilter = {};

  const addSelectableValue = (
    attributeName: string,
    index: number,
    value: number,
    enumValues: (string | number)[]
  ) => {
    const existsValue = attributesForFilter[attributeName].find(({ id }) => id === value);
    if (existsValue) {
      existsValue.count += 1;
    } else {
      attributesForFilter[attributeName].push({
        index,
        key: attributeName,
        id: value,
        value: enumValues[value].toString(),
        count: 1
      });
    }
  };

  tokens.forEach(({ attributes }) => {
    if (!attributes) {
      return;
    }

    // Calculate filters to show
    attributes.forEach((attribute, index) => {
      const { trait_type, values } = attributesSchema[index];
      const attributeName = (trait_type || '').toLocaleLowerCase();

      if (!attributeName) {
        return;
      }

      if (!attributesForFilter[attributeName]) {
        attributesForFilter[attributeName] = [];
      }

      const value = attributeMapper(attribute);

      if (!value) {
        return;
      }

      if (values) {
        if (Array.isArray(value)) {
          value.forEach((v) => addSelectableValue(attributeName, index, v, values));
        }
        return;
      }

      const stringValue = (value as { _: string })?._;

      const existsValue = attributesForFilter[attributeName].find(
        ({ value }) => value === stringValue
      );
      if (existsValue) {
        existsValue.count += 1;
      } else {
        attributesForFilter[attributeName].push({
          index,
          key: attributeName,
          value: stringValue,
          count: 1
        });
      }
    });
  });

  return attributesForFilter;
};

export const capitalize = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

export const ellipsisText = (text: string, allowSymbols = 30) => {
  if (text.length > allowSymbols) {
    const nextSpacePosition = text.indexOf(' ', allowSymbols);
    if (!nextSpacePosition) {
      return text;
    }
    return text.slice(0, nextSpacePosition) + '…';
  }
  return text;
};

export const parseInvalidAttributes = (
  tokens: NewToken[],
  collectionProperties: TokenProperty[]
): { token: NewToken; invalidAttributes: number[] }[] => {
  const requiredAttributes: number[] = collectionProperties
    .filter((property) => property.key.startsWith('attributesSchema.'))
    .map((property, index) => ({
      optional: JSON.parse(property.value)?.optional,
      index: index
    }))
    .filter((schema) => schema.optional === false)
    .map((schema) => schema.index);

  const invalidTokensMap: Map<number, { token: NewToken; invalidAttributes: number[] }> = new Map();

  for (const attr of requiredAttributes) {
    tokens.forEach((token) => {
      if (!token.attributes[attr]) {
        const tokenId = token.id;
        const existingEntry = invalidTokensMap.get(tokenId);
        if (existingEntry) {
          existingEntry.invalidAttributes.push(attr);
        } else {
          invalidTokensMap.set(tokenId, { token, invalidAttributes: [attr] });
        }
      }
    });
  }
  const invalidTokensArray: { token: NewToken; invalidAttributes: number[] }[] = Array.from(invalidTokensMap.values());
  return invalidTokensArray;
};
