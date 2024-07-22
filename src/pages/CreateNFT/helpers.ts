import { PotentialAttribute, AttributeSchemaDto, CreateTokenBody, Attribute as UniqueAttribute, TokenV2ItemForMultipleDto, CreateTokenPayload, TokenProperty, Media } from '@unique-nft/sdk';

import { Attribute, AttributeOption, AttributesForFilter, CreateMediaData, NewToken, NewToken2 } from './types';
import { SpecialFilters } from './components/useFilteredTokens';

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
  tokens: NewToken2[],
): TokenV2ItemForMultipleDto[] => {
  return tokens.map((token) => mapNewToken(token));
};

export const mapNewToken = (
  token: NewToken2,
): TokenV2ItemForMultipleDto => {
  const mappedTokenDto: TokenV2ItemForMultipleDto = {
    image: token.ipfsCid?.fullUrl,
    attributes: token.attributes,
    royalties: token.royalties?.map(({value, ...rest}) => ({...rest, percent: +value})),
    animation_url: token.animationURLIpfsCid?.fullUrl,
    media: token.media && getCreateMediaData(token.media),
  };

  console.log(mappedTokenDto, 'mappedTokenDto');

  return mappedTokenDto;
};

export const mapAttributes = (
  attributes: Attribute[],
  schema?: PotentialAttribute[]
) => {
  let attr: UniqueAttribute[] = [];
  if (schema && attributes?.length) {
    attr = attributes.reduce<UniqueAttribute[]>(
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
  return attr;
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

// export parseAttr = (token) => {
//   tokens.forEach((token) => {
//     const tokenAttributes = token.attributes;
//     tokenAttributes.forEach((el, key) => {
//       const isArray = propertiesIsArrayMap.get(key);
//       if (!isArray && Array.isArray(el)) {
//         token.attributes[key] = el[0];
//       }
//     });
//   });
// }

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
      if( !attributesSchema[index]?.trait_type || !attributesSchema[index]?.values)  return;
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

interface TransformedMedia {
  [key: string]: Media;
}

const getCreateMediaData = (mediaArray: CreateMediaData[]): TransformedMedia => {
  const transformedMedia: TransformedMedia = {};

  mediaArray.forEach((mediaItem) => {
    const { name, type, ipfsCid } = mediaItem;
    const url = ipfsCid && ipfsCid.fullUrl;
    transformedMedia[name] = {
      type: type as 'image' | 'animation' | 'video' | 'audio' | 'spatial' | 'pdf' | 'document' | 'other', 
      url: url as string,
      name
    };
  });

  return transformedMedia;
};


export const getUniqueTraitTypes = (tokens: NewToken2[]): string[] => {
  const traitTypesSet = new Set<string>();

  tokens.forEach((token) => {
    token.attributes.forEach((attribute) => {
      traitTypesSet.add(attribute.trait_type);
    });
  });

  return Array.from(traitTypesSet);
};

export type TraitCount = {
  trait_type: string;
  items: {value: string; count: number}[]
};

export const getTraitCounts = (tokens: NewToken2[]): TraitCount[] => {
  const traitMap: { [key: string]: { [key: string]: number } } = {};

  tokens.forEach((token) => {
    token.attributes.forEach((attribute) => {
      if (!traitMap[attribute.trait_type]) {
        traitMap[attribute.trait_type] = {};
      }
      if (!traitMap[attribute.trait_type][attribute.value]) {
        traitMap[attribute.trait_type][attribute.value] = 0;
      }
      traitMap[attribute.trait_type][attribute.value]++;
    });
  });

  const traitCounts: TraitCount[] = [];

  Object.keys(traitMap).forEach((trait_type) => {
    const items = Object.keys(traitMap[trait_type]).map((value) => ({
      value,
      count: traitMap[trait_type][value],
    }));
    traitCounts.push({
      trait_type,
      items,
    });
  });

  return traitCounts;
};
export type ItemCount = {name: string, count: number};

export const getNameCounts = (tokens: NewToken2[]): ItemCount[] => {
  const nameMap: { [key: string]: number } = {};

  tokens.forEach((token) => {
    const name = token.name || SpecialFilters.NoName;
    if (!nameMap[name]) {
      nameMap[name] = 0;
    }
    nameMap[name]++;
  });

  const nameCounts: ItemCount[] = Object.keys(nameMap).map((name) => ({
    name,
    count: nameMap[name],
  }));

  return nameCounts;
};

export const getDescriptionCounts = (tokens: NewToken2[]): ItemCount[] => {
  const descriptionMap: { [key: string]: number } = {};

  tokens.forEach((token) => {
    const description = token.description || SpecialFilters.NoDescription;
    if (!descriptionMap[description]) {
      descriptionMap[description] = 0;
    }
    descriptionMap[description]++;
  });

  const descriptionCounts: ItemCount[] = Object.keys(descriptionMap).map((description) => ({
    name: description,
    count: descriptionMap[description],
  }));

  return descriptionCounts;
};
